using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
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
            }).WithDescription("Create a new team. Upon success, returns the ID of the new team.");

            group.MapGet("/", async (TeamService teamService) =>
            {
                var teams = await teamService.GetAllTeamsAsync();

                if (!teams.Any()) return Results.NotFound("No teams found.");

                return Results.Ok(teams);
            }).WithDescription("Retrieve all the teams.");

            group.MapGet("/{id:long}", async (long id, TeamService teamService) =>
            {
                var team = await teamService.GetTeamByIdAsync(id);

                if (team == null) return Results.NotFound("Team was not found.");

                return Results.Ok(team);
            }).WithDescription("Retrieve a team by ID.");

            group.MapPut("/{id:long}", async (long id, UpdateTeamRequest updateTeamRequest, TeamService teamService) =>
            {
                var updatedTeam = teamService.UpdateTeamAsync(id, updateTeamRequest);

                if (updatedTeam == null)
                    return Results.NotFound("Team not found");

                return Results.Ok(updatedTeam);
            }).WithDescription("Update the team's information.");

            group.MapDelete("/{id:long}", async (long id, TeamService teamService) =>
            {
                await teamService.DeleteTeamAsync(id);

                return Results.NoContent();
            }).WithDescription("Deletes a team by ID.");
        }
    }
}