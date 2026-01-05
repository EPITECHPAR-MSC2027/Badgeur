using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class FloorService
    {
        private readonly Client _client;

        public FloorService(Client client)
        {
            _client = client;
        }

        public virtual async Task<long> CreateFloorAsync(CreateFloorRequest request)
        {
            var floor = new Floor
            {
                FloorNumber = request.FloorNumber
            };

            var response = await _client.From<Floor>().Insert(floor);
            return response.Models.First().Id;
        }

        public virtual async Task<List<FloorResponse>> GetAllFloorsAsync()
        {
            var response = await _client.From<Floor>().Get();

            return response.Models.Select(f => CreateFloorResponse(f)).ToList();
        }

        public virtual async Task<FloorResponse?> GetFloorByIdAsync(long id)
        {
            var response = await _client.From<Floor>().Where(f => f.Id == id).Get();
            var floor = response.Models.FirstOrDefault();

            if (floor == null) return null;

            return CreateFloorResponse(floor);
        }

        public virtual async Task<FloorResponse?> UpdateFloorAsync(long id, UpdateFloorRequest updateFloorRequest)
        {
            var request = await _client.From<Floor>().Where(f => f.Id == id).Get();
            var floor = request.Models.FirstOrDefault();

            if (floor == null) return null;

            floor.FloorNumber = updateFloorRequest.FloorNumber;

            request = await _client.From<Floor>().Update(floor);

            return CreateFloorResponse(floor);
        }

        public virtual async Task DeleteFloorAsync(long id)
        {
            await _client.From<Floor>().Where(f => f.Id == id).Delete();
        }

        public virtual FloorResponse CreateFloorResponse(Floor floor)
        {
            return new FloorResponse
            {
                Id = floor.Id,
                FloorNumber = floor.FloorNumber
            };
        }
    }
}

