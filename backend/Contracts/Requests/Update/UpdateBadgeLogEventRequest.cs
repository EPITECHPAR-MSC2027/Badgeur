using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Update
{

    public class UpdateBadgeLogEventRequest
    {
        public DateTime BadgedAt { get; set; }

        public long UserId { get; set; }
    }
}
