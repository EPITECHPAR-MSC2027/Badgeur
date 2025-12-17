using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Update
{
    [JsonSerializable(typeof(UpdateVehiculeRequest))]
    public class UpdateVehiculeRequest
    {
        public string Name { get; set; } = default!;
        public long Capacity { get; set; }
        public string FuelType { get; set; } = default!;
        public string LicensePlate { get; set; } = default!;
        public string TransmissionType { get; set; } = default!;
        public string TypeVehicule { get; set; } = default!;
    }
}

