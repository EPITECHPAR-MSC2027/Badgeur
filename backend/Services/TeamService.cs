using badgeur_backend.Contracts.Requests;
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

        public async Task<long> CreateTeamAsync(CreateTeamRequest request)
        {
            var team = new Team
            {
                TeamName = request.TeamName,
                ManagerId = request.ManagerId,
            };

            var response = await _client.From<Team>().Insert(team);
            return response.Models.First().Id;
        }

        public async Task<List<TeamResponse>> GetAllTeamsAsync()
        {
            var response = await _client.From<Team>().Get();

            return response.Models.Select(t => createTeamResponse(t)).ToList();
        }

        public async Task<TeamResponse?> GetTeamByIdAsync(long id)
        {
            var response = await _client.From<Team>().Where(n => n.Id == id).Get();
            var team = response.Models.FirstOrDefault();

            if (team == null) return null;

            return createTeamResponse(team);
        }

        public async Task<TeamResponse?> updateTeamManagerAsync(long id, long newManagerId)
        {
            var request = await _client.From<Team>().Where(n => n.Id == id).Get();
            var team = request.Models.FirstOrDefault();

            if (team == null) return null;

            team.ManagerId = newManagerId;

            request = await _client.From<Team>().Update(team);

            return createTeamResponse(team);
        }

        public async Task DeleteTeamAsync(long id)
        {
            await _client.From<Team>().Where(n => n.Id == id).Delete();
        }

        public TeamResponse createTeamResponse(Team team)
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