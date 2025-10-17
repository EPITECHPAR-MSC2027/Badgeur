using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Create
{

    [JsonSerializable(typeof(CreateTeamRequest))]
    public class CreateTeamRequest
    {
        public required string TeamName { get; set; }

        public required long ManagerId { get; set; }
    }
}
