using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class DemandTypeService
    {
        private readonly Client _client;

        public DemandTypeService(Client client)
        {
            _client = client;
        }

        public async Task<long> CreateDemandTypeAsync(CreateDemandTypeRequest request)
        {
            var entity = new DemandType { Nom = request.Nom };
            var response = await _client.From<DemandType>().Insert(entity);

            return response.Models.First().Id;
        }

        public async Task<List<DemandTypeResponse>> GetAllDemandTypesAsync()
        {
            var response = await _client.From<DemandType>().Get();

            return response.Models.Select(CreateResponse).ToList();
        }

        public async Task<DemandTypeResponse?> GetDemandTypeByIdAsync(long id)
        {
            var response = await _client.From<DemandType>().Where(t => t.Id == id).Get();
            var entity = response.Models.FirstOrDefault();

            if (entity == null) return null;

            return CreateResponse(entity);
        }

        public async Task<DemandTypeResponse?> UpdateDemandTypeAsync(long id, UpdateDemandTypeRequest request)
        {
            var response = await _client.From<DemandType>().Where(t => t.Id == id).Get();
            var entity = response.Models.FirstOrDefault();

            if (entity == null) return null;

            entity.Nom = request.Nom;
            await _client.From<DemandType>().Update(entity);

            return CreateResponse(entity);
        }

        public async Task DeleteDemandTypeAsync(long id)
        {
            await _client.From<DemandType>().Where(t => t.Id == id).Delete();
        }

        public DemandTypeResponse CreateResponse(DemandType entity)
        {
            return new DemandTypeResponse
            {
                Id = entity.Id,
                Nom = entity.Nom
            };
        }
    }
}


