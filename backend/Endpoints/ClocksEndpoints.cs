using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
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
                return await HandleCreateClocks(request, clocksService);
            }).WithDescription("Create a new clocks entity.");

            group.MapGet("/", async (ClocksService clocksService) =>
            {
                return await HandleGetAllClocks(clocksService);
            }).WithDescription("Get all clocks entities.");

            group.MapGet("/{id:long}", async (long id, ClocksService clocksService) =>
            {
                return await HandleGetClocksById(id, clocksService);
            }).WithDescription("Get clocks entity by ID.");

            group.MapGet("/user/{userId:long}", async (long userId, ClocksService clocksService) =>
            {
                return await HandleGetAllClocksByUserId(userId, clocksService);
            }).WithDescription("Get all clocks entities for a specific user.");

            group.MapPut("/{id:long}", async (long id, UpdateClocksRequest request, ClocksService clocksService) =>
            {
                return await HandleUpdateClocks(id, request, clocksService);
            }).WithDescription("Update a clocks entity by ID.");

            group.MapDelete("/{id:long}", async (long id, ClocksService clocksService) =>
            {
                return await HandleDeleteClocks(id, clocksService);
            }).WithDescription("Delete a clocks entity by ID.");
        }

        public static async Task<IResult> HandleCreateClocks(CreateClocksRequest request, ClocksService clocksService)
        {
            var clocks = await clocksService.CreateClocksAsync(request);

            if (clocks == null)
                return Results.BadRequest("Failed to create a new clocks entity.");

            return Results.Ok(clocks);
        }

        public static async Task<IResult> HandleGetAllClocks(ClocksService clocksService)
        {
            var clocks = await clocksService.GetAllClocksAsync();

            if (!clocks.Any())
                return Results.NotFound("No clock entities found.");

            return Results.Ok(clocks);
        }

        public static async Task<IResult> HandleGetClocksById(long id, ClocksService clocksService)
        {
            var clocks = await clocksService.GetClocksByIdAsync(id);

            if (clocks == null)
                return Results.NotFound("Clock entity was not found.");

            return Results.Ok(clocks);
        }

        public static async Task<IResult> HandleGetAllClocksByUserId(long userId, ClocksService clocksService)
        {
            var clocks = await clocksService.GetAllClocksByUserIdAsync(userId);

            if (!clocks.Any())
                return Results.NotFound("No clock entities found for this user.");

            return Results.Ok(clocks);
        }

        public static async Task<IResult> HandleUpdateClocks(long id, UpdateClocksRequest request, ClocksService clocksService)
        {
            var updatedClocks = await clocksService.UpdateClocksAsync(id, request);

            if (updatedClocks == null)
                return Results.NotFound("Clock entity not found.");

            return Results.Ok(updatedClocks);
        }

        public static async Task<IResult> HandleDeleteClocks(long id, ClocksService clocksService)
        {
            await clocksService.DeleteClocksAsync(id);
            return Results.NoContent();
        }
    }
}