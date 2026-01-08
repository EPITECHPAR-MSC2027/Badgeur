using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Update
{
    public class UpdateBookingRoomRequest
    {
        public long RoomId { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime StartDatetime { get; set; }
        public DateTime EndDatetime { get; set; }
    }
}


