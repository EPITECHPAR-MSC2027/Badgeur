using badgeur_backend.Contracts.Requests;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class TypeDemandeEndpoints
    {
        public static void MapTypeDemandeEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/type-demandes");

            group.MapPost("/", async (CreateTypeDemandeRequest request, TypeDemandeService service) =>
            {
                var id = await service.CreateTypeDemandeAsync(request);
                return Results.Ok(id);
            }).WithDescription("Create a new type_demande and return its ID.");

            group.MapGet("/", async (TypeDemandeService service) =>
            {
                var list = await service.GetAllTypeDemandesAsync();
                if (!list.Any()) return Results.NotFound("No type_demandes found.");
                return Results.Ok(list);
            }).WithDescription("Retrieve all type_demandes.");

            group.MapGet("/{id:long}", async (long id, TypeDemandeService service) =>
            {
                var item = await service.GetTypeDemandeByIdAsync(id);
                return item is null ? Results.NotFound("TypeDemande not found.") : Results.Ok(item);
            }).WithDescription("Retrieve a type_demande by ID.");

            group.MapPut("/{id:long}", async (long id, UpdateTypeDemandeRequest request, TypeDemandeService service) =>
            {
                var updated = await service.UpdateTypeDemandeAsync(id, request);
                return updated is null ? Results.NotFound("TypeDemande not found.") : Results.Ok(updated);
            }).WithDescription("Update a type_demande by ID.");

            group.MapDelete("/{id:long}", async (long id, TypeDemandeService service) =>
            {
                await service.DeleteTypeDemandeAsync(id);
                return Results.NoContent();
            }).WithDescription("Delete a type_demande by ID.");
        }
    }
}


