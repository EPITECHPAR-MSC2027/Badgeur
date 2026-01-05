using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class VehiculeService
    {
        private readonly Client _client;

        public VehiculeService(Client client)
        {
            _client = client;
        }

        public async Task<long> CreateVehiculeAsync(CreateVehiculeRequest request)
        {
            var vehicule = new Vehicule
            {
                Name = request.Name,
                Capacity = request.Capacity,
                FuelType = request.FuelType,
                LicensePlate = request.LicensePlate,
                TransmissionType = request.TransmissionType,
                TypeVehicule = request.TypeVehicule
            };

            var response = await _client.From<Vehicule>().Insert(vehicule);
            return response.Models.First().Id;
        }

        public async Task<List<VehiculeResponse>> GetAllVehiculesAsync()
        {
            var response = await _client.From<Vehicule>().Get();

            return response.Models.Select(v => CreateVehiculeResponse(v)).ToList();
        }

        public async Task<VehiculeResponse?> GetVehiculeByIdAsync(long id)
        {
            var response = await _client.From<Vehicule>().Where(v => v.Id == id).Get();
            var vehicule = response.Models.FirstOrDefault();

            if (vehicule == null) return null;

            return CreateVehiculeResponse(vehicule);
        }

        public async Task<VehiculeResponse?> UpdateVehiculeAsync(long id, UpdateVehiculeRequest updateVehiculeRequest)
        {
            var request = await _client.From<Vehicule>().Where(v => v.Id == id).Get();
            var vehicule = request.Models.FirstOrDefault();

            if (vehicule == null) return null;

            vehicule.Name = updateVehiculeRequest.Name;
            vehicule.Capacity = updateVehiculeRequest.Capacity;
            vehicule.FuelType = updateVehiculeRequest.FuelType;
            vehicule.LicensePlate = updateVehiculeRequest.LicensePlate;
            vehicule.TransmissionType = updateVehiculeRequest.TransmissionType;
            vehicule.TypeVehicule = updateVehiculeRequest.TypeVehicule;

            request = await _client.From<Vehicule>().Update(vehicule);

            return CreateVehiculeResponse(vehicule);
        }

        public async Task DeleteVehiculeAsync(long id)
        {
            await _client.From<Vehicule>().Where(v => v.Id == id).Delete();
        }

        public VehiculeResponse CreateVehiculeResponse(Vehicule vehicule)
        {
            return new VehiculeResponse
            {
                Id = vehicule.Id,
                Name = vehicule.Name,
                Capacity = vehicule.Capacity,
                FuelType = vehicule.FuelType,
                LicensePlate = vehicule.LicensePlate,
                TransmissionType = vehicule.TransmissionType,
                TypeVehicule = vehicule.TypeVehicule
            };
        }
    }
}

