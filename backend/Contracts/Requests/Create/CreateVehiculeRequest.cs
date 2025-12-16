using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Create
{
    [JsonSerializable(typeof(CreateVehiculeRequest))]
    public class CreateVehiculeRequest
    {
        public required string Name { get; set; }
        public required long Capacity { get; set; }
        public required string FuelType { get; set; }
        public required string LicensePlate { get; set; }
        public required string TransmissionType { get; set; }
    }
}

