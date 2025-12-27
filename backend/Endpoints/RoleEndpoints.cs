using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class RoleEndpoints
    {
        public static void MapRoleEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/roles");

            group.MapGet("/", HandleGetAllRoles)
                .WithDescription("Retrieve all roles.");

            group.MapGet("/{id:long}", HandleGetRoleById)
                .WithDescription("Retrieve a role by ID.");
        }

        public static async Task<IResult> HandleGetAllRoles(RoleService roleService)
        {
            var roles = await roleService.GetAllRolesAsync();

            if (!roles.Any()) return Results.NotFound("No roles found.");

            return Results.Ok(roles);
        }

        public static async Task<IResult> HandleGetRoleById(long id, RoleService roleService)
        {
            var role = await roleService.GetRoleByIdAsync(id);

            if (role == null) return Results.NotFound("Role was not found.");

            return Results.Ok(role);
        }
    }
}