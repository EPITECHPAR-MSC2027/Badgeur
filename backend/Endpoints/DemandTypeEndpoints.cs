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
                var id = await service.CreateDemandTypeAsync(request);

                return Results.Ok(id);
            }).WithDescription("Create a new type_demande and return its ID.");

            group.MapGet("/", async (DemandTypeService service) =>
            {
                var list = await service.GetAllDemandTypesAsync();

                if (!list.Any()) return Results.NotFound("No type_demandes found.");

                return Results.Ok(list);
            }).WithDescription("Retrieve all type_demandes.");

            group.MapGet("/{id:long}", async (long id, DemandTypeService service) =>
            {
                var item = await service.GetDemandTypeByIdAsync(id);

                return item is null ? Results.NotFound("DemandType not found.") : Results.Ok(item);
            }).WithDescription("Retrieve a type_demande by ID.");

            group.MapPut("/{id:long}", async (long id, UpdateDemandTypeRequest request, DemandTypeService service) =>
            {
                var updated = await service.UpdateDemandTypeAsync(id, request);

                return updated is null ? Results.NotFound("DemandType not found.") : Results.Ok(updated);
            }).WithDescription("Update a type_demande by ID.");

            group.MapDelete("/{id:long}", async (long id, DemandTypeService service) =>
            {
                await service.DeleteDemandTypeAsync(id);

                return Results.NoContent();
            }).WithDescription("Delete a type_demande by ID.");
        }
    }
}


