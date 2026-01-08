using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Update
{
    public class UpdateTeamRequest
    {
        public long ManagerId { get; set; } = default!;

        public string TeamName { get; set; } = default!;
    }
}
