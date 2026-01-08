namespace badgeur_backend.Contracts.Responses
{
    public class BookingRoomParticipantResponse
    {
        public long Id { get; set; }
        public long BookingId { get; set; }
        public long UserId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}


