using badgeur_backend.Contracts.Requests;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class UserService
    {
        private readonly Client _client;

        public UserService(Client client)
        {
            _client = client;
        }

        public async Task<long> CreateUserAsync(CreateUserRequest request)
        {
            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                RoleId = request.RoleId,
                TeamId = request.TeamId
            };

            var response = await _client.From<User>().Insert(user);
            return response.Models.First().Id;
        }

        public async Task<List<UserResponse>> GetAllUsersAsync()
        {
            var response = await _client.From<User>().Get();

            return response.Models.Select(u => new UserResponse
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                RoleId = u.RoleId,
                TeamId = u.TeamId ?? 0
            }).ToList();
        }

        public async Task<UserResponse?> GetUserByIdAsync(long id)
        {
            var response = await _client.From<User>().Where(n => n.Id == id).Get();
            var user = response.Models.FirstOrDefault();

            if (user == null) return null;

            return new UserResponse
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                RoleId = user.RoleId,
                TeamId = user.TeamId ?? 0
            };
        }

        public async Task DeleteUserAsync(long id)
        {
            await _client.From<User>().Where(n => n.Id == id).Delete();
        }
    }
}