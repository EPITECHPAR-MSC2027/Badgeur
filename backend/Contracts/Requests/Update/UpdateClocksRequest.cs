using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Update
{
    [JsonSerializable(typeof(UpdateClocksRequest))]
    public class UpdateClocksRequest
    {
        public long UserId { get; set; }

        public DateTime Date { get; set; } // Only the date, no time

        public DateTimeOffset TimeArrivedAt { get; set; }

        public DateTimeOffset TimeDepartedAt { get; set; }
    }
}


