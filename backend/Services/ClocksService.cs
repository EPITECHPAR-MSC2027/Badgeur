using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using bageur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class ClocksService
    {
        private readonly Client _client;

        public ClocksService(Client client)
        {
            _client = client;
        }

        public virtual async Task<ClocksResponse> CreateClocksAsync(CreateClocksRequest request)
        {
            var clocks = new Clocks
            {
                UserId = request.UserId,
                Date = request.Date,
                TimeArrivedAt = request.TimeArrivedAt,
                TimeDepartedAt = request.TimeDepartedAt
            };

            var response = await _client.From<Clocks>().Insert(clocks);

            return CreateClocksResponse(clocks);
        }

        public virtual async Task<List<ClocksResponse>> GetAllClocksAsync()
        {
            var response = await _client.From<Clocks>().Get();

            return response.Models.Select(c => CreateClocksResponse(c)).ToList();
        }

        public virtual async Task<ClocksResponse?> GetClocksByIdAsync(long id)
        {
            var response = await _client.From<Clocks>().Where(n => n.Id == id).Get();
            var clocks = response.Models.FirstOrDefault();

            if (clocks == null) return null;

            return CreateClocksResponse(clocks);
        }

        public virtual async Task<List<ClocksResponse>> GetAllClocksByUserIdAsync(long userId)
        {
            var response = await _client.From<Clocks>().Where(n => n.UserId == userId).Get();

            return response.Models.Select(c => CreateClocksResponse(c)).ToList();
        }

        public virtual async Task<ClocksResponse?> UpdateClocksAsync(long id, UpdateClocksRequest updateClocksRequest)
        {
            var request = await _client.From<Clocks>().Where(n => n.Id == id).Get();
            var clocks = request.Models.FirstOrDefault();

            if (clocks == null) return null;

            clocks.UserId = updateClocksRequest.UserId;
            clocks.Date = updateClocksRequest.Date;
            clocks.TimeArrivedAt = updateClocksRequest.TimeArrivedAt;
            clocks.TimeDepartedAt = updateClocksRequest.TimeDepartedAt;

            request = await _client.From<Clocks>().Update(clocks);

            return CreateClocksResponse(clocks);
        }

        public virtual async Task DeleteClocksAsync(long id)
        {
            await _client.From<Clocks>().Where(n => n.Id == id).Delete();
        }

        public virtual ClocksResponse CreateClocksResponse(Clocks clocks)
        {
            return new ClocksResponse
            {
                Id = clocks.Id,
                UserId = clocks.UserId,
                Date = clocks.Date,
                TimeArrivedAt = clocks.TimeArrivedAt,
                TimeDepartedAt = clocks.TimeDepartedAt
            };
        }
    }
}
