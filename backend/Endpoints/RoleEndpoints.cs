using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class RoleEndpoints
    {
        public static void MapRoleEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/roles");

            group.MapGet("/", async (RoleService roleService) =>
            {
                var roles = await roleService.GetAllRolesAsync();

                if (!roles.Any()) return Results.NotFound("No roles found.");

                return Results.Ok(roles);
            }).WithDescription("Retrieve all roles.");

            group.MapGet("/{id:long}", async (long id, RoleService roleService) =>
            {
                var role = await roleService.GetRoleByIdAsync(id);

                if (role == null) return Results.NotFound("Role was not found.");

                return Results.Ok(role);
            }).WithDescription("Retrieve a role by ID.");
        }
    }
}