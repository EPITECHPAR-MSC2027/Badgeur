using System;

namespace badgeur_backend.Contracts.Requests.Create
{
    public class CreateBookingRoomRequest
    {
        public long UserId { get; set; }
        public long RoomId { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime StartDatetime { get; set; }
        public DateTime EndDatetime { get; set; }
    }
}