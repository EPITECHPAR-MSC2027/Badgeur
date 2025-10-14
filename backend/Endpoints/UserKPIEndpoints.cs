using badgeur_backend.Services;
using Supabase;

namespace badgeur_backend.Endpoints
{
    public static class UserKPIEndpoints
    {
        public static void MapUserKPIEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/kpis");

            // Endpoint pour récupérer ses propres KPIs
            group.MapGet("/me", async (UserKPIService userKPIService, HttpContext context) =>
            {
                // Récupérer l'utilisateur connecté depuis le middleware
                var authenticatedUser = context.Items["User"] as Supabase.Gotrue.User;
                if (authenticatedUser == null)
                {
                    return Results.Unauthorized();
                }

                // Récupérer les informations de l'utilisateur connecté depuis la base de données
                var userService = context.RequestServices.GetRequiredService<UserService>();
                var connectedUser = await userService.GetUserByEmailAsync(authenticatedUser.Email);
                
                if (connectedUser == null)
                {
                    return Results.Unauthorized();
                }

                var userKPIs = await userKPIService.CalculateAllUserKPIs(connectedUser.Id);

                if (userKPIs == null) return Results.NotFound("Failed to calcuate KPIs. Contact an administrator.");

                return Results.Ok(userKPIs);
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
                var connectedUser = await userService.GetUserByEmailAsync(authenticatedUser.Email);
                
                if (connectedUser == null)
                {
                    return Results.Unauthorized();
                }

                // Vérifier que l'utilisateur peut accéder à ces KPIs
                // Pour l'instant, on permet seulement d'accéder à ses propres KPIs
                // TODO: Ajouter la logique pour les managers/admins
                if (connectedUser.Id != userId)
                {
                    return Results.Forbid("Vous ne pouvez accéder qu'à vos propres KPIs.");
                }

                var userKPIs = await userKPIService.CalculateAllUserKPIs(userId);

                if (userKPIs == null) return Results.NotFound("Failed to calcuate KPIs. Contact an administrator.");

                return Results.Ok(userKPIs);
            }).WithDescription("Retrieve KPIs for a specific user. Users can only access their own KPIs." +
            "Always calculates KPIs upon being called. If there is already a database entry for a User, it will update it. Otherwise it will create it.");
        }
    }
}