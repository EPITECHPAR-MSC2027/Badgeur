namespace badgeur_backend.Contracts.Responses
{
    public class VehiculeResponse
    {
        public required long Id { get; set; }
        public required string Name { get; set; }
        public required long Capacity { get; set; }
        public required string FuelType { get; set; }
        public required string LicensePlate { get; set; }
        public required string TransmissionType { get; set; }
        public required string TypeVehicule { get; set; }
    }
}

