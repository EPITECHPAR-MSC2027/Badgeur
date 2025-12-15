using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
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
                return await HandleCreatePlanning(request, service);
            }).WithDescription("Create a new planning and return its ID.");

            group.MapGet("/", async (PlanningService service) =>
            {
                return await HandleGetAllPlannings(service);
            }).WithDescription("Retrieve all plannings.");

            group.MapGet("/{id:long}", async (long id, PlanningService service) =>
            {
                return await HandleGetPlanningById(id, service);
            }).WithDescription("Retrieve a planning by ID.");

            group.MapGet("/by-user/{userId:long}", async (long userId, PlanningService service) =>
            {
                return await HandleGetPlanningsByUser(userId, service);
            }).WithDescription("Retrieve plannings by user ID.");

            group.MapPut("/{id:long}", async (long id, UpdatePlanningRequest request, PlanningService service) =>
            {
                return await HandleUpdatePlanning(id, request, service);
            }).WithDescription("Update a planning by ID.");

            group.MapDelete("/{id:long}", async (long id, PlanningService service) =>
            {
                return await HandleDeletePlanning(id, service);
            }).WithDescription("Delete a planning by ID.");
        }

        public static async Task<IResult> HandleCreatePlanning(CreatePlanningRequest request, PlanningService service)
        {
            var id = await service.CreatePlanningAsync(request);

            if (id == 0)
                return Results.BadRequest("Failed to create a new planning.");

            return Results.Ok(id);
        }

        public static async Task<IResult> HandleGetAllPlannings(PlanningService service)
        {
            var list = await service.GetAllPlanningsAsync();

            if (!list.Any())
                return Results.NotFound("No plannings found.");

            return Results.Ok(list);
        }

        public static async Task<IResult> HandleGetPlanningById(long id, PlanningService service)
        {
            var item = await service.GetPlanningByIdAsync(id);

            if (item == null)
                return Results.NotFound("Planning not found.");

            return Results.Ok(item);
        }

        public static async Task<IResult> HandleGetPlanningsByUser(long userId, PlanningService service)
        {
            var list = await service.GetPlanningsByUserAsync(userId);

            if (!list.Any())
                return Results.NotFound("No plannings for this user.");

            return Results.Ok(list);
        }

        public static async Task<IResult> HandleUpdatePlanning(long id, UpdatePlanningRequest request, PlanningService service)
        {
            var updated = await service.UpdatePlanningAsync(id, request);

            if (updated == null)
                return Results.NotFound("Planning not found.");

            return Results.Ok(updated);
        }

        public static async Task<IResult> HandleDeletePlanning(long id, PlanningService service)
        {
            await service.DeletePlanningAsync(id);
            return Results.NoContent();
        }
    }
}