namespace badgeur_backend.Contracts.Responses
{
    public class BookingRoomResponse
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public long RoomId { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime StartDatetime { get; set; }
        public DateTime EndDatetime { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}


