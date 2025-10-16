using badgeur_backend.Contracts.Requests;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class PlanningEndpoints
    {
        public static void MapPlanningEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/plannings");

            group.MapPost("/", async (CreatePlanningRequest request, PlanningService service) =>
            {
                var id = await service.CreatePlanningAsync(request);

                return Results.Ok(id);
            }).WithDescription("Create a new planning and return its ID.");

            group.MapGet("/", async (PlanningService service) =>
            {
                var list = await service.GetAllPlanningsAsync();

                if (!list.Any()) return Results.NotFound("No plannings found.");
                return Results.Ok(list);
            }).WithDescription("Retrieve all plannings.");

            group.MapGet("/{id:long}", async (long id, PlanningService service) =>
            {
                var item = await service.GetPlanningByIdAsync(id);

                return item is null ? Results.NotFound("Planning not found.") : Results.Ok(item);
            }).WithDescription("Retrieve a planning by ID.");

            group.MapGet("/by-user/{userId:long}", async (long userId, PlanningService service) =>
            {
                var list = await service.GetPlanningsByUserAsync(userId);

                if (!list.Any()) return Results.NotFound("No plannings for this user.");

                return Results.Ok(list);
            }).WithDescription("Retrieve plannings by user ID.");

            group.MapPut("/{id:long}", async (long id, UpdatePlanningRequest request, PlanningService service) =>
            {
                var updated = await service.UpdatePlanningAsync(id, request);

                return updated is null ? Results.NotFound("Planning not found.") : Results.Ok(updated);
            }).WithDescription("Update a planning by ID.");

            group.MapDelete("/{id:long}", async (long id, PlanningService service) =>
            {
                await service.DeletePlanningAsync(id);

                return Results.NoContent();
            }).WithDescription("Delete a planning by ID.");
        }
    }
}


