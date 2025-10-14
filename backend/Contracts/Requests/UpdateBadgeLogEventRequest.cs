using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests
{

    [JsonSerializable(typeof(UpdateBadgeLogEventRequest))]
    public class UpdateBadgeLogEventRequest
    {
        public DateTime BadgedAt { get; set; }

        public long UserId { get; set; }
    }
}
