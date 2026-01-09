using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class VehiculeEndpoints
    {
        public static void MapVehiculeEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/vehicules");

            group.MapPost("/", async (CreateVehiculeRequest request, VehiculeService vehiculeService) =>
            {
                long? id = await vehiculeService.CreateVehiculeAsync(request);

                if (id == null)
                    return Results.BadRequest("Failed to create a new vehicule.");

                return Results.Ok(id);
            }).WithDescription("Create a new vehicule and returns the vehicule ID.");

            group.MapGet("/", async (VehiculeService vehiculeService) =>
            {
                var vehicules = await vehiculeService.GetAllVehiculesAsync();

                if (!vehicules.Any()) return Results.NotFound("No vehicules found.");

                return Results.Ok(vehicules);
            }).WithDescription("Retrieves all vehicules from the database.");

            group.MapGet("/{id:long}", async (long id, VehiculeService vehiculeService) =>
            {
                var vehicule = await vehiculeService.GetVehiculeByIdAsync(id);

                if (vehicule == null) return Results.NotFound("Vehicule was not found.");

                return Results.Ok(vehicule);
            }).WithDescription("Retrieve a vehicule by their ID.");

            group.MapPut("/{id:long}", async (long id, UpdateVehiculeRequest request, VehiculeService vehiculeService) =>
            {
                var updatedVehicule = await vehiculeService.UpdateVehiculeAsync(id, request);

                if (updatedVehicule == null)
                    return Results.NotFound("Vehicule not found");

                return Results.Ok(updatedVehicule);
            }).WithDescription("Update the vehicule's information");

            group.MapDelete("/{id:long}", async (long id, VehiculeService vehiculeService) =>
            {
                await vehiculeService.DeleteVehiculeAsync(id);

                return Results.NoContent();
            }).WithDescription("Delete a vehicule by their ID.");
        }
    }
}

