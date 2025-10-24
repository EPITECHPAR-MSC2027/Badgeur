using badgeur_backend.Contracts.Responses;

namespace badgeur_backend.Services
{
    public interface IUserLookup
    {
        Task<UserResponse?> GetUserByEmailAsync(string email);
    }

    public sealed class UserServiceAdapter : IUserLookup
    {
        private readonly UserService _userService;

        public UserServiceAdapter(UserService userService)
        {
            _userService = userService;
        }

        public Task<UserResponse?> GetUserByEmailAsync(string email) => _userService.GetUserByEmailAsync(email);
    }
}
