namespace badgeur_backend.Contracts.Responses
{
    public class BookingVehiculeResponse
    {
        public required long IdBookingVehicule { get; set; }
        public required long IdVehicule { get; set; }
        public required long UserId { get; set; }
        public required DateTime StartDatetime { get; set; }
        public required DateTime EndDatetime { get; set; }
        public required DateTime CreatedAt { get; set; }
        public required string Destination { get; set; }
    }
}

