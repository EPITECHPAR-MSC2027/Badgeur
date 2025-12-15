using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Create
{
    [JsonSerializable(typeof(CreateBookingRoomParticipantRequest))]
    public class CreateBookingRoomParticipantRequest
    {
        public long BookingId { get; set; }
        public long UserId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}


