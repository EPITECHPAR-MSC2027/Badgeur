using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class DemandTypeEndpoints
    {
        public static void MapTypeDemandeEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/type-demandes");

            group.MapPost("/", async (CreateDemandTypeRequest request, DemandTypeService service) =>
            {
                return await HandleCreateDemandType(request, service);
            }).WithDescription("Create a new type_demande and return its ID.");

            group.MapGet("/", async (DemandTypeService service) =>
            {
                return await HandleGetAllDemandTypes(service);
            }).WithDescription("Retrieve all type_demandes.");

            group.MapGet("/{id:long}", async (long id, DemandTypeService service) =>
            {
                return await HandleGetDemandTypeById(id, service);
            }).WithDescription("Retrieve a type_demande by ID.");

            group.MapPut("/{id:long}", async (long id, UpdateDemandTypeRequest request, DemandTypeService service) =>
            {
                return await HandleUpdateDemandType(id, request, service);
            }).WithDescription("Update a type_demande by ID.");

            group.MapDelete("/{id:long}", async (long id, DemandTypeService service) =>
            {
                return await HandleDeleteDemandType(id, service);
            }).WithDescription("Delete a type_demande by ID.");
        }

        public static async Task<IResult> HandleCreateDemandType(CreateDemandTypeRequest request, DemandTypeService service)
        {
            var id = await service.CreateDemandTypeAsync(request);

            if (id == 0)
                return Results.BadRequest("Failed to create a new demand type.");

            return Results.Ok(id);
        }

        public static async Task<IResult> HandleGetAllDemandTypes(DemandTypeService service)
        {
            var list = await service.GetAllDemandTypesAsync();

            if (!list.Any())
                return Results.NotFound("No type_demandes found.");

            return Results.Ok(list);
        }

        public static async Task<IResult> HandleGetDemandTypeById(long id, DemandTypeService service)
        {
            var item = await service.GetDemandTypeByIdAsync(id);

            if (item == null)
                return Results.NotFound("DemandType not found.");

            return Results.Ok(item);
        }

        public static async Task<IResult> HandleUpdateDemandType(long id, UpdateDemandTypeRequest request, DemandTypeService service)
        {
            var updated = await service.UpdateDemandTypeAsync(id, request);

            if (updated == null)
                return Results.NotFound("DemandType not found.");

            return Results.Ok(updated);
        }

        public static async Task<IResult> HandleDeleteDemandType(long id, DemandTypeService service)
        {
            await service.DeleteDemandTypeAsync(id);
            return Results.NoContent();
        }
    }
}