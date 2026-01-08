using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Create
{
    public class CreateBookingVehiculeRequest
    {
        public required long IdVehicule { get; set; }
        public required long UserId { get; set; }
        public required DateTime StartDatetime { get; set; }
        public required DateTime EndDatetime { get; set; }
        public required string Destination { get; set; }
    }
}

