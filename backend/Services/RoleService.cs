using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class RoleService
    {
        private readonly Client _client;

        public RoleService(Client client)
        {
            _client = client;
        }

        public virtual async Task<long> CreateRoleAsync(CreateRoleRequest request)
        {
            var role = new Role
            {
                RoleName = request.RoleName
            };

            var response = await _client.From<Role>().Insert(role);

            return response.Models.First().Id;
        }

        public virtual async Task<List<RoleResponse>> GetAllRolesAsync()
        {
            var response = await _client.From<Role>().Get();

            return response.Models.Select(r => new RoleResponse
            {
                Id = r.Id,
                RoleName = r.RoleName
            }).ToList();
        }

        public virtual async Task<RoleResponse?> GetRoleByIdAsync(long id)
        {
            var response = await _client.From<Role>().Where(n => n.Id == id).Get();
            var role = response.Models.FirstOrDefault();

            if (role == null) return null;

            return new RoleResponse
            {
                Id = role.Id,
                RoleName = role.RoleName
            };
        }

        public virtual async Task DeleteRoleAsync(long id)
        {
            await _client.From<Role>().Where(n => n.Id == id).Delete();
        }
    }
}