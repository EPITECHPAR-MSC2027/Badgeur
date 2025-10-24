using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Create
{

    [JsonSerializable(typeof(CreateBadgeLogEventRequest))]
    public class CreateBadgeLogEventRequest
    {
        public required DateTime BadgedAt { get; set; }

        public required long UserId { get; set; }
    }
}
