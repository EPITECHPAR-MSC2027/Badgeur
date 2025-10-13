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
                Telephone = request.Telephone,
                Email = request.Email,
                RoleId = request.RoleId,
                TeamId = request.TeamId
            };

            var response = await _client.From<User>().Insert(user);
            return response.Models.First().Id;
        }

        public async Task<List<UserResponse>> GetAllUsersAsync()
        {
            var response = await _client.From<User>().Get();

            return response.Models.Select(u => createUserResponse(u)).ToList();
        }

        public async Task<UserResponse?> GetUserByIdAsync(long id)
        {
            var response = await _client.From<User>().Where(n => n.Id == id).Get();
            var user = response.Models.FirstOrDefault();

            if (user == null) return null;

            return createUserResponse(user);
        }

        public async Task<UserResponse?> GetUserByEmailAsync(string email)
        {
            var response = await _client.From<User>().Where(n => n.Email == email).Get();
            var user = response.Models.FirstOrDefault();

            if (user == null) return null;

            return createUserResponse(user);
        }

        public async Task<UserResponse?> updateUserRoleAsync(long id, long newRoleId)
        {
            var request = await _client.From<User>().Where(n => n.Id == id).Get();
            var user = request.Models.FirstOrDefault();

            if (user == null) return null;

            user.RoleId = newRoleId;

            request = await _client.From<User>().Update(user);

            return createUserResponse(user);
        }


        public async Task DeleteUserAsync(long id)
        {
            await _client.From<User>().Where(n => n.Id == id).Delete();
        }

        public UserResponse createUserResponse(User user)
        {
            return new UserResponse
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Telephone = user.Telephone,
                RoleId = user.RoleId,
                TeamId = user.TeamId ?? 0
            };
        }

        public async Task<bool> IsUserManager(long id, RoleService roleService)
        {
            UserResponse user = await GetUserByIdAsync(id);
            RoleResponse role = await roleService.GetRoleByIdAsync(user.RoleId);

            if (role.RoleName == "Manager")
            {
                return true;
            }

            return false;
        }
    }
}