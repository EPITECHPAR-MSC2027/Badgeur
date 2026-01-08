using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Create
{
    public class CreateVehiculeRequest
    {
        public required string Name { get; set; }
        public required long Capacity { get; set; }
        public required string FuelType { get; set; }
        public required string LicensePlate { get; set; }
        public required string TransmissionType { get; set; }
        public required string TypeVehicule { get; set; }
    }
}

