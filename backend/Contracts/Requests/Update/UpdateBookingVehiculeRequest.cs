using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Update
{
    [JsonSerializable(typeof(UpdateBookingVehiculeRequest))]
    public class UpdateBookingVehiculeRequest
    {
        public long IdVehicule { get; set; }
        public long UserId { get; set; }
        public DateTime StartDatetime { get; set; }
        public DateTime EndDatetime { get; set; }
    }
}

