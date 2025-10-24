﻿using badgeur_backend.Services;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Endpoints
{
    public static class UserKPIEndpoints
    {
        public static void MapUserKPIEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/kpis");

            // Endpoint pour récupérer ses propres KPIs
            group.MapGet("/me", async (UserKPIService userKPIService, BadgeLogEventService badgeLogEventService, HttpContext context) =>
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

                // Calculate new KPIs
                var hoursPerDay = await userKPIService.CalculateRollingAverageWorkingHours(connectedUser.Id, UserKPIService.Period.TWO_WEEKS);
                var hoursPerWeek = await userKPIService.CalculateWeeklyWorkingHours(connectedUser.Id);
                
                // Calculate working days and presence rate for the last 14 days
                var cutoffDate = DateTime.UtcNow.Date.AddDays(-14);
                var events = await badgeLogEventService.GetBadgeLogEventsByUserIdAsync(connectedUser.Id);
                var recentEvents = events.Where(e => e.BadgedAt.Date >= cutoffDate).ToList();
                
                var workingDays = recentEvents
                    .GroupBy(e => e.BadgedAt.Date)
                    .Where(g => g.Count() >= 2)
                    .Count();
                
                var totalDays = 14;
                var presenceRate = totalDays > 0 ? (double)workingDays / totalDays * 100 : 0;

                var response = new UserKPIResponse
                {
                    Id = 1, // Placeholder since we're not persisting this
                    UserId = connectedUser.Id,
                    HoursPerDay = hoursPerDay,
                    HoursPerWeek = hoursPerWeek,
                    WorkingDays = workingDays,
                    TotalDays = totalDays,
                    PresenceRate = Math.Round(presenceRate, 1),
                    // Legacy fields for backward compatibility
                    Raat7 = DateTimeOffset.MinValue,
                    Radt7 = DateTimeOffset.MinValue,
                    Raw7 = hoursPerDay,
                    Raat14 = DateTimeOffset.MinValue,
                    Raat28 = DateTimeOffset.MinValue,
                    Radt14 = DateTimeOffset.MinValue,
                    Radt28 = DateTimeOffset.MinValue,
                    Raw14 = hoursPerDay,
                    Raw28 = hoursPerDay
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