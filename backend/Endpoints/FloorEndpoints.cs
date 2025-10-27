using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class FloorEndpoints
    {
        public static void MapFloorEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/floors");

            group.MapPost("/", async (CreateFloorRequest request, FloorService floorService) =>
            {
                var id = await floorService.CreateFloorAsync(request);

                if (id == null)
                    return Results.BadRequest("Failed to create a new floor.");

                return Results.Ok(id);
            }).WithDescription("Create a new floor. Upon success, returns the ID of the new floor.");

            group.MapGet("/", async (FloorService floorService) =>
            {
                var floors = await floorService.GetAllFloorsAsync();

                if (!floors.Any()) return Results.NotFound("No floors found.");

                return Results.Ok(floors);
            }).WithDescription("Retrieve all the floors.");

            group.MapGet("/{id:long}", async (long id, FloorService floorService) =>
            {
                var floor = await floorService.GetFloorByIdAsync(id);

                if (floor == null) return Results.NotFound("Floor was not found.");

                return Results.Ok(floor);
            }).WithDescription("Retrieve a floor by ID.");

            group.MapPut("/{id:long}", async (long id, UpdateFloorRequest updateFloorRequest, FloorService floorService) =>
            {
                var updatedFloor = await floorService.UpdateFloorAsync(id, updateFloorRequest);

                if (updatedFloor == null)
                    return Results.NotFound("Floor not found");

                return Results.Ok(updatedFloor);
            }).WithDescription("Update the floor's information.");

            group.MapDelete("/{id:long}", async (long id, FloorService floorService) =>
            {
                await floorService.DeleteFloorAsync(id);

                return Results.NoContent();
            }).WithDescription("Deletes a floor by ID.");
        }
    }
}

