using badgeur_backend.Contracts.Requests;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class PlanningService
    {
        private readonly Client _client;

        public PlanningService(Client client)
        {
            _client = client;
        }

        public async Task<long> CreatePlanningAsync(CreatePlanningRequest request)
        {
            var planning = new Planning
            {
                UserId = request.UserId,
                Date = request.Date,
                Period = request.Period,
                Statut = request.Statut,
                DemandTypeId = request.TypeDemandeId,
                CreatedAt = DateTime.UtcNow
            };

            var response = await _client.From<Planning>().Insert(planning);

            return response.Models.First().Id;
        }

        public async Task<List<PlanningResponse>> GetAllPlanningsAsync()
        {
            var response = await _client.From<Planning>().Get();

            return response.Models.Select(CreatePlanningResponse).ToList();
        }

        public async Task<List<PlanningResponse>> GetPlanningsByUserAsync(long userId)
        {
            var response = await _client.From<Planning>().Where(p => p.UserId == userId).Get();

            return response.Models.Select(CreatePlanningResponse).ToList();
        }

        public async Task<PlanningResponse?> GetPlanningByIdAsync(long id)
        {
            var response = await _client.From<Planning>().Where(p => p.Id == id).Get();
            var planning = response.Models.FirstOrDefault();

            if (planning == null) return null;
            return CreatePlanningResponse(planning);
        }

        public async Task<PlanningResponse?> UpdatePlanningAsync(long id, UpdatePlanningRequest request)
        {
            var query = await _client.From<Planning>().Where(p => p.Id == id).Get();
            var planning = query.Models.FirstOrDefault();

            if (planning == null) return null;

            planning.Date = request.Date;
            planning.Period = request.Period;
            planning.Statut = request.Statut;
            planning.DemandTypeId = request.TypeDemandeId;

            await _client.From<Planning>().Update(planning);
            return CreatePlanningResponse(planning);
        }

        public async Task DeletePlanningAsync(long id)
        {
            await _client.From<Planning>().Where(p => p.Id == id).Delete();
        }

        public PlanningResponse CreatePlanningResponse(Planning planning)
        {
            return new PlanningResponse
            {
                Id = planning.Id,
                UserId = planning.UserId,
                Date = planning.Date,
                Period = planning.Period,
                Statut = planning.Statut,
                CreatedAt = planning.CreatedAt,
                DemandTypeId = planning.DemandTypeId
            };
        }
    }
}


