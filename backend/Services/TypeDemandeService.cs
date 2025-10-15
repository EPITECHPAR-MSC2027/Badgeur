using badgeur_backend.Contracts.Requests;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class TypeDemandeService
    {
        private readonly Client _client;

        public TypeDemandeService(Client client)
        {
            _client = client;
        }

        public async Task<long> CreateTypeDemandeAsync(CreateTypeDemandeRequest request)
        {
            var entity = new TypeDemande { Nom = request.Nom };
            var response = await _client.From<TypeDemande>().Insert(entity);
            return response.Models.First().Id;
        }

        public async Task<List<TypeDemandeResponse>> GetAllTypeDemandesAsync()
        {
            var response = await _client.From<TypeDemande>().Get();
            return response.Models.Select(CreateResponse).ToList();
        }

        public async Task<TypeDemandeResponse?> GetTypeDemandeByIdAsync(long id)
        {
            var response = await _client.From<TypeDemande>().Where(t => t.Id == id).Get();
            var entity = response.Models.FirstOrDefault();
            if (entity == null) return null;
            return CreateResponse(entity);
        }

        public async Task<TypeDemandeResponse?> UpdateTypeDemandeAsync(long id, UpdateTypeDemandeRequest request)
        {
            var response = await _client.From<TypeDemande>().Where(t => t.Id == id).Get();
            var entity = response.Models.FirstOrDefault();
            if (entity == null) return null;
            entity.Nom = request.Nom;
            await _client.From<TypeDemande>().Update(entity);
            return CreateResponse(entity);
        }

        public async Task DeleteTypeDemandeAsync(long id)
        {
            await _client.From<TypeDemande>().Where(t => t.Id == id).Delete();
        }

        public TypeDemandeResponse CreateResponse(TypeDemande entity)
        {
            return new TypeDemandeResponse
            {
                Id = entity.Id,
                Nom = entity.Nom
            };
        }
    }
}


