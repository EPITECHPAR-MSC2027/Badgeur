using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class TeamService
    {
        private readonly Client _client;

        public TeamService(Client client)
        {
            _client = client;
        }

        public virtual async Task<long> CreateTeamAsync(CreateTeamRequest request)
        {
            var team = new Team
            {
                TeamName = request.TeamName,
                ManagerId = request.ManagerId,
            };

            var response = await _client.From<Team>().Insert(team);
            return response.Models.First().Id;
        }

        public virtual async Task<List<TeamResponse>> GetAllTeamsAsync()
        {
            var response = await _client.From<Team>().Get();

            return response.Models.Select(t => CreateTeamResponse(t)).ToList();
        }

        public virtual async Task<TeamResponse?> GetTeamByIdAsync(long id)
        {
            var response = await _client.From<Team>().Where(n => n.Id == id).Get();
            var team = response.Models.FirstOrDefault();

            if (team == null) return null;

            return CreateTeamResponse(team);
        }

        public virtual async Task<TeamResponse?> UpdateTeamAsync(long id, UpdateTeamRequest updateTeamRequest)
        {
            var request = await _client.From<Team>().Where(n => n.Id == id).Get();
            var team = request.Models.FirstOrDefault();

            if (team == null) return null;

            team.TeamName = updateTeamRequest.TeamName;
            team.ManagerId = updateTeamRequest.ManagerId;

            request = await _client.From<Team>().Update(team);

            return CreateTeamResponse(team);
        }

        public virtual async Task DeleteTeamAsync(long id)
        {
            await _client.From<Team>().Where(n => n.Id == id).Delete();
        }

        public TeamResponse CreateTeamResponse(Team team)
        {
            return new TeamResponse
            {
                Id = team.Id,
                TeamName = team.TeamName,
                ManagerId = team.ManagerId
            };
        }
    }
}