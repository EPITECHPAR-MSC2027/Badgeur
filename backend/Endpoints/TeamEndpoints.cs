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

            group.MapPost("/", HandleCreateTeam)
                .WithDescription("Create a new team. Upon success, returns the ID of the new team.");

            group.MapGet("/", HandleGetAllTeams)
                .WithDescription("Retrieve all the teams.");

            group.MapGet("/{id:long}", HandleGetTeamById)
                .WithDescription("Retrieve a team by ID.");

            group.MapPut("/{id:long}", HandleUpdateTeam)
                .WithDescription("Update the team's information.");

            group.MapDelete("/{id:long}", HandleDeleteTeam)
                .WithDescription("Deletes a team by ID.");
        }

        public static async Task<IResult> HandleCreateTeam(CreateTeamRequest request, TeamService teamService)
        {
            var id = await teamService.CreateTeamAsync(request);

            if (id == 0)
                return Results.BadRequest("Failed to create a new team.");

            return Results.Ok(id);
        }

        public static async Task<IResult> HandleGetAllTeams(TeamService teamService)
        {
            var teams = await teamService.GetAllTeamsAsync();

            if (!teams.Any()) return Results.NotFound("No teams found.");

            return Results.Ok(teams);
        }

        public static async Task<IResult> HandleGetTeamById(long id, TeamService teamService)
        {
            var team = await teamService.GetTeamByIdAsync(id);

            if (team == null) return Results.NotFound("Team was not found.");

            return Results.Ok(team);
        }

        public static async Task<IResult> HandleUpdateTeam(long id, UpdateTeamRequest updateTeamRequest, TeamService teamService)
        {
            var updatedTeam = await teamService.UpdateTeamAsync(id, updateTeamRequest);

            if (updatedTeam == null)
                return Results.NotFound("Team not found");

            return Results.Ok(updatedTeam);
        }

        public static async Task<IResult> HandleDeleteTeam(long id, TeamService teamService)
        {
            await teamService.DeleteTeamAsync(id);

            return Results.NoContent();
        }
    }
}