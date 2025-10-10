using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests
{

    [JsonSerializable(typeof(UpdateTeamManagerRequest))]
    public class UpdateTeamManagerRequest
    {
        public required long NewManagerId { get; set; }
    }
}
