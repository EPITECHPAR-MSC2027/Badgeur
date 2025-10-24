using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Responses
{
    [JsonSerializable(typeof(UserSummaryResponse))]
    public class UserSummaryResponse
    {
        public long UserId { get; set; }
        public List<UserDayInterval> Days { get; set; } = new();

    }

    public class UserDayInterval
    {
        public DateTimeOffset Arrival { get; set; }
        public DateTimeOffset Departure { get; set; }
    }
}
