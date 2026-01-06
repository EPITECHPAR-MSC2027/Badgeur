using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace badgeur_backend.Services
{
    public class UserService
    {
        private readonly Client _client;

        public UserService(Client client)
        {
            _client = client;
        }

        public virtual async Task<long> CreateUserAsync(CreateUserRequest request)
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

        public virtual async Task<List<UserResponse>> GetAllUsersAsync()
        {
            var response = await _client.From<User>().Get();

            return response.Models.Select(u => CreateUserResponse(u)).ToList();
        }

        public virtual async Task<UserResponse?> GetUserByIdAsync(long id)
        {
            var response = await _client.From<User>().Where(n => n.Id == id).Get();
            var user = response.Models.FirstOrDefault();

            if (user == null) return null;

            return CreateUserResponse(user);
        }

        public virtual async Task<UserResponse?> GetUserByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;

            // Normaliser l'email (trim et lowercase pour la comparaison)
            var normalizedEmail = email.Trim().ToLowerInvariant();
            
            // Récupérer tous les utilisateurs et comparer en mémoire (car Supabase Postgrest 
            // ne supporte pas directement les comparaisons insensibles à la casse)
            var response = await _client.From<User>().Get();
            var user = response.Models.FirstOrDefault(u => 
                u.Email?.Trim().ToLowerInvariant() == normalizedEmail);

            if (user == null) return null;

            return CreateUserResponse(user);
        }

        // TODO: This method needs to be scrapped as the inclusion of UpdateUserAsync renders it deprecated
        public virtual async Task<UserResponse?> updateUserRoleAsync(long id, long newRoleId)
        {
            var request = await _client.From<User>().Where(n => n.Id == id).Get();
            var user = request.Models.FirstOrDefault();

            if (user == null) return null;

            user.RoleId = newRoleId;

            request = await _client.From<User>().Update(user);

            return CreateUserResponse(user);
        }

        public virtual async Task<UserResponse?> UpdateUserAsync(long id, UpdateUserRequest updateUserRequest)
        {
            var request = await _client.From<User>().Where(n => n.Id == id).Get();
            var user = request.Models.FirstOrDefault();

            if (user == null) return null;

            // Update the user retrieved from the database with the new desired information
            user.FirstName = updateUserRequest.FirstName;
            user.LastName = updateUserRequest.LastName;
            user.Telephone = updateUserRequest.Telephone;
            user.RoleId = updateUserRequest.RoleId;
            user.TeamId = updateUserRequest.TeamId;

            request = await _client.From<User>().Update(user);

            return CreateUserResponse(user);
        }

        public virtual async Task DeleteUserAsync(long id)
        {
            await _client.From<User>().Where(n => n.Id == id).Delete();
        }

        public virtual async Task<List<UserResponse>> GetUsersByTeamIdAsync(long teamId)
        {
            var response = await _client.From<User>().Where(n => n.TeamId == teamId).Get();

            return response.Models.Select(u => CreateUserResponse(u)).ToList();
        }

        public UserResponse CreateUserResponse(User user)
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