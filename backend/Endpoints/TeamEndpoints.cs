using badgeur_backend.Contracts.Requests;
using badgeur_backend.Models;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class TeamEndpoints
    {
        public static void MapTeamEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/teams");

            group.MapPost("/", async (CreateTeamRequest request, TeamService teamService) =>
            {
                var id = await teamService.CreateTeamAsync(request);

                if (id == null)
                    return Results.BadRequest("Failed to create a new team.");

                return Results.Ok(id);
            });

            group.MapGet("/", async (TeamService teamService) =>
            {
                var teams = await teamService.GetAllTeamsAsync();

                if (!teams.Any()) return Results.NotFound("No teams found.");

                return Results.Ok(teams);
            });

            group.MapGet("/{id:long}", async (long id, TeamService teamService) =>
            {
                var team = await teamService.GetTeamByIdAsync(id);

                if (team == null) return Results.NotFound("Team was not found.");

                return Results.Ok(team);
            });

            group.MapPut("/{id:long}/manager", async (long id, UpdateTeamManagerRequest request, TeamService teamService, RoleService roleService, UserService userService) =>
            {
                if (!await userService.IsUserManager(request.NewManagerId, roleService))
                {
                    return Results.Problem("That employee is not a manager");
                }

                var updatedTeam = await teamService.updateTeamManagerAsync(id, request.NewManagerId);
                
                if (updatedTeam == null)
                    return Results.NotFound("Team not found.");

                return Results.Ok(updatedTeam);
            });

            group.MapDelete("/{id:long}", async (long id, TeamService teamService) =>
            {
                await teamService.DeleteTeamAsync(id);

                return Results.NoContent();
            });
        }
    }
}