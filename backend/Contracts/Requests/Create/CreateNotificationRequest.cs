using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Create
{
    [JsonSerializable(typeof(CreateNotificationRequest))]
    public class CreateNotificationRequest
    {
        public long UserId { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public long? RelatedId { get; set; }
    }
}

