using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class ClockEndpoints
    {
        public static void MapClocksEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/clocks");

            group.MapPost("/", async (CreateClocksRequest request, ClocksService clocksService) =>
            {
                var clocks = await clocksService.CreateClocksAsync(request);

                if (clocks == null)
                    return Results.BadRequest("Failed to create a new team");

                return Results.Ok(clocks);
            }).WithDescription("Create a new clocks entity.");

            group.MapGet("/", async (ClocksService clocksService) =>
            {
                var clocks = await clocksService.GetAllClocksAsync();

                if (!clocks.Any()) return Results.NotFound("No clock entities found");

                return Results.Ok(clocks);
            }).WithDescription("Get all clocks entities.");

            group.MapGet("/{id:long}", async (long id, ClocksService clocksService) =>
            {
                var clocks = await clocksService.GetClocksByIdAsync(id);

                if (clocks == null) return Results.NotFound("No clock entity found");

                return Results.Ok(clocks);
            }).WithDescription("Get clocks entity by ID.");

        }
    }
}