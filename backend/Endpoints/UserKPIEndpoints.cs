using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class UserKPIEndpoints
    {
        public static void MapUserKPIEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/kpis");

            group.MapGet("/{userId:long}", async (long userId, UserKPIService userKPIService) =>
            {
                var userKPIs = userKPIService.CalculateAllUserKPIs(userId);

                if (userKPIs == null) return Results.NotFound("Failed to calcuate KPIs. Contact an administrator.");

                return Results.Ok(userKPIs);
            }).WithDescription("Retrieve all KPIs for all users." +
            "Always calculates KPIs upon being called. If there is already a database entry for a User, it will update it. Otherwise it will create it.");
        }
    }
}