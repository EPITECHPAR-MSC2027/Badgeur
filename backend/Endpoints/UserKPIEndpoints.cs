using badgeur_backend.Models;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class UserKPIEndpoints
    {
        public static void MapUserKPIEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/reports");

            // Endpoint pour récupérer ses propres KPIs
            group.MapGet("/", async (UserKPIService userKPIService, HttpContext context) =>
            {
                // Récupérer l'utilisateur connecté depuis le middleware
                var authenticatedUser = context.Items["User"] as Supabase.Gotrue.User;
                if (authenticatedUser == null)
                {
                    return Results.Unauthorized();
                }

                // Récupérer les informations de l'utilisateur connecté depuis la base de données
                var userService = context.RequestServices.GetRequiredService<UserService>();
                var connectedUser = await userService.GetUserByEmailAsync(authenticatedUser.Email ?? "");

                if (connectedUser == null)
                {
                    return Results.Unauthorized();
                }

                var userKPIs = await userKPIService.CalculateAllUserKPIs(connectedUser.Id);

                if (userKPIs == null) return Results.NotFound("Failed to calcuate KPIs. Contact an administrator.");

                // Enrichir avec les KPIs sur 7 jours, calculés à la volée
                var response = new UserKPIResponse
                {
                    Id = userKPIs.Id,
                    UserId = userKPIs.UserId,
                    Raat14 = userKPIs.Raat14,
                    Raat28 = userKPIs.Raat28,
                    Radt14 = userKPIs.Radt14,
                    Radt28 = userKPIs.Radt28,
                    Raw14 = userKPIs.Raw14,
                    Raw28 = userKPIs.Raw28,
                    // Valeurs 7 jours (avec gestion des cas insuffisants)
                    Raat7 = await userKPIService.CalculateRollingAverageArrivalTime(connectedUser.Id, UserKPIService.Period.ONE_WEEK),
                    Radt7 = await userKPIService.CalculateRollingAverageDepartureTime(connectedUser.Id, UserKPIService.Period.ONE_WEEK),
                    Raw7 = await userKPIService.CalculateRollingAverageWorkingHours(connectedUser.Id, UserKPIService.Period.ONE_WEEK)
                };

                return Results.Ok(response);
            }).WithDescription("Retrieve KPIs for the authenticated user." +
            "Always calculates KPIs upon being called. If there is already a database entry for a User, it will update it. Otherwise it will create it.");

            // Endpoint pour récupérer les KPIs d'un utilisateur spécifique (avec vérification des permissions)
            group.MapGet("/{userId:long}", async (long userId, UserKPIService userKPIService, HttpContext context) =>
            {
                // Récupérer l'utilisateur connecté depuis le middleware
                var authenticatedUser = context.Items["User"] as Supabase.Gotrue.User;
                if (authenticatedUser == null)
                {
                    return Results.Unauthorized();
                }

                // Récupérer les informations de l'utilisateur connecté depuis la base de données
                var userService = context.RequestServices.GetRequiredService<UserService>();
                var connectedUser = await userService.GetUserByEmailAsync(authenticatedUser.Email ?? "");

                if (connectedUser == null)
                {
                    return Results.Unauthorized();
                }

                // Vérifier que l'utilisateur peut accéder à ces KPIs
                // Pour l'instant, on permet seulement d'accéder à ses propres KPIs
                // TODO: Ajouter la logique pour les managers/admins
                if (connectedUser.Id != userId)
                {
                    return Results.Forbid();
                }

                var userKPIs = await userKPIService.CalculateAllUserKPIs(userId);

                if (userKPIs == null) return Results.NotFound("Failed to calcuate KPIs. Contact an administrator.");

                var response = new UserKPIResponse
                {
                    Id = userKPIs.Id,
                    UserId = userKPIs.UserId,
                    Raat14 = userKPIs.Raat14,
                    Raat28 = userKPIs.Raat28,
                    Radt14 = userKPIs.Radt14,
                    Radt28 = userKPIs.Radt28,
                    Raw14 = userKPIs.Raw14,
                    Raw28 = userKPIs.Raw28,
                    Raat7 = await userKPIService.CalculateRollingAverageArrivalTime(userId, UserKPIService.Period.ONE_WEEK),
                    Radt7 = await userKPIService.CalculateRollingAverageDepartureTime(userId, UserKPIService.Period.ONE_WEEK),
                    Raw7 = await userKPIService.CalculateRollingAverageWorkingHours(userId, UserKPIService.Period.ONE_WEEK)
                };

                return Results.Ok(response);
            }).WithDescription("Retrieve KPIs for a specific user. Users can only access their own KPIs." +
            "Always calculates KPIs upon being called. If there is already a database entry for a User, it will update it. Otherwise it will create it.");
        }
    }
}