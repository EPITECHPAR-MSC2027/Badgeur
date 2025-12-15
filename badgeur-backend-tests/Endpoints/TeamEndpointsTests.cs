using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Endpoints;
using badgeur_backend.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace badgeur_backend_tests.Endpoints
{
    public class TeamEndpointsTests
    {
        private sealed class FakeTeamService : TeamService
        {
            private readonly long _createTeamId;
            private readonly List<TeamResponse> _teams;
            private readonly TeamResponse? _team;
            private readonly TeamResponse? _updatedTeam;

            public FakeTeamService(
                long createTeamId = 0,
                List<TeamResponse>? teams = null,
                TeamResponse? team = null,
                TeamResponse? updatedTeam = null) : base(null!)
            {
                _createTeamId = createTeamId;
                _teams = teams ?? new List<TeamResponse>();
                _team = team;
                _updatedTeam = updatedTeam;
            }

            public override async Task<long> CreateTeamAsync(CreateTeamRequest request)
            {
                return await Task.FromResult(_createTeamId);
            }

            public override async Task<List<TeamResponse>> GetAllTeamsAsync()
            {
                return await Task.FromResult(_teams);
            }

            public override async Task<TeamResponse?> GetTeamByIdAsync(long id)
            {
                return await Task.FromResult(_team);
            }

            public override async Task<TeamResponse?> UpdateTeamAsync(long id, UpdateTeamRequest updateTeamRequest)
            {
                return await Task.FromResult(_updatedTeam);
            }

            public override async Task DeleteTeamAsync(long id)
            {
                await Task.CompletedTask;
            }
        }

        #region CreateTeam Tests

        [Fact]
        public async Task HandleCreateTeam_Returns_BadRequest_When_Creation_Fails()
        {
            var request = new CreateTeamRequest { TeamName = "Engineering", ManagerId = 1 };
            var teamService = new FakeTeamService(createTeamId: 0);

            var result = await TeamEndpoints.HandleCreateTeam(request, teamService);

            result.Should().BeOfType<BadRequest<string>>();
            var badRequest = (BadRequest<string>)result;
            badRequest.Value.Should().Be("Failed to create a new team.");
        }

        [Fact]
        public async Task HandleCreateTeam_Returns_Ok_With_TeamId_On_Success()
        {
            var request = new CreateTeamRequest { TeamName = "Engineering", ManagerId = 1 };
            var teamService = new FakeTeamService(createTeamId: 100);

            var result = await TeamEndpoints.HandleCreateTeam(request, teamService);

            result.Should().BeOfType<Ok<long>>();
            var ok = (Ok<long>)result;
            ok.Value.Should().Be(100);
        }

        #endregion

        #region GetAllTeams Tests

        [Fact]
        public async Task HandleGetAllTeams_Returns_NotFound_When_No_Teams_Exist()
        {
            var teamService = new FakeTeamService(teams: new List<TeamResponse>());

            var result = await TeamEndpoints.HandleGetAllTeams(teamService);

            result.Should().BeOfType<NotFound<string>>();
            var notFound = (NotFound<string>)result;
            notFound.Value.Should().Be("No teams found.");
        }

        [Fact]
        public async Task HandleGetAllTeams_Returns_Ok_With_TeamList_On_Success()
        {
            var teams = new List<TeamResponse>
            {
                new TeamResponse { Id = 1, TeamName = "Engineering", ManagerId = 10 },
                new TeamResponse { Id = 2, TeamName = "Sales", ManagerId = 20 },
                new TeamResponse { Id = 3, TeamName = "Marketing", ManagerId = 30 }
            };
            var teamService = new FakeTeamService(teams: teams);

            var result = await TeamEndpoints.HandleGetAllTeams(teamService);

            result.Should().BeOfType<Ok<List<TeamResponse>>>();
            var ok = (Ok<List<TeamResponse>>)result;
            ok.Value.Should().HaveCount(3);
            ok.Value![0].TeamName.Should().Be("Engineering");
            ok.Value![1].ManagerId.Should().Be(20);
            ok.Value![2].Id.Should().Be(3);
        }

        #endregion

        #region GetTeamById Tests

        [Fact]
        public async Task HandleGetTeamById_Returns_NotFound_When_Team_Does_Not_Exist()
        {
            var teamService = new FakeTeamService(team: null);

            var result = await TeamEndpoints.HandleGetTeamById(999, teamService);

            result.Should().BeOfType<NotFound<string>>();
            var notFound = (NotFound<string>)result;
            notFound.Value.Should().Be("Team was not found.");
        }

        [Fact]
        public async Task HandleGetTeamById_Returns_Ok_With_Team_On_Success()
        {
            var team = new TeamResponse { Id = 1, TeamName = "Engineering", ManagerId = 15 };
            var teamService = new FakeTeamService(team: team);

            var result = await TeamEndpoints.HandleGetTeamById(1, teamService);

            result.Should().BeOfType<Ok<TeamResponse>>();
            var ok = (Ok<TeamResponse>)result;
            ok.Value.Should().NotBeNull();
            ok.Value!.Id.Should().Be(1);
            ok.Value!.TeamName.Should().Be("Engineering");
            ok.Value!.ManagerId.Should().Be(15);
        }

        #endregion

        #region UpdateTeam Tests

        [Fact]
        public async Task HandleUpdateTeam_Returns_NotFound_When_Team_Does_Not_Exist()
        {
            var request = new UpdateTeamRequest { TeamName = "Updated Team", ManagerId = 5 };
            var teamService = new FakeTeamService(updatedTeam: null);

            var result = await TeamEndpoints.HandleUpdateTeam(999, request, teamService);

            result.Should().BeOfType<NotFound<string>>();
            var notFound = (NotFound<string>)result;
            notFound.Value.Should().Be("Team not found");
        }

        [Fact]
        public async Task HandleUpdateTeam_Returns_Ok_With_UpdatedTeam_On_Success()
        {
            var request = new UpdateTeamRequest { TeamName = "Updated Engineering", ManagerId = 25 };
            var updatedTeam = new TeamResponse { Id = 1, TeamName = "Updated Engineering", ManagerId = 25 };
            var teamService = new FakeTeamService(updatedTeam: updatedTeam);

            var result = await TeamEndpoints.HandleUpdateTeam(1, request, teamService);

            result.Should().BeOfType<Ok<TeamResponse>>();
            var ok = (Ok<TeamResponse>)result;
            ok.Value.Should().NotBeNull();
            ok.Value!.Id.Should().Be(1);
            ok.Value!.TeamName.Should().Be("Updated Engineering");
            ok.Value!.ManagerId.Should().Be(25);
        }

        #endregion

        #region DeleteTeam Tests

        [Fact]
        public async Task HandleDeleteTeam_Returns_NoContent_On_Success()
        {
            var teamService = new FakeTeamService();

            var result = await TeamEndpoints.HandleDeleteTeam(1, teamService);

            result.Should().BeOfType<NoContent>();
        }

        #endregion
    }
}