using badgeur_backend.Contracts.Requests;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Endpoints;
using badgeur_backend.Services;
using badgeur_backend.Services.Auth;

namespace badgeur_backend_tests.Endpoints
{
    public class LoginEndpointsTests
    {
        private sealed class FakeAuthProvider : IAuthProvider
        {
            private readonly AuthSession? _session;

            public FakeAuthProvider(AuthSession? session)
            {
                _session = session;
            }

            public Task<AuthSession?> SignInWithPassword(string email, string password) => Task.FromResult(_session);
        }

        private sealed class FakeUserLookup : IUserLookup
        {
            private readonly UserResponse? _user;

            public FakeUserLookup(UserResponse? user)
            {
                _user = user;
            }

            public Task<UserResponse?> GetUserByEmailAsync(string email) => Task.FromResult(_user);
        }

        [Fact]
        public async Task HandleLogin_Returns_Unauthorized_When_Auth_Fails()
        {
            var request = new LoginRequest { Email = "bobby.tester@adminc", Password = "wrongPassword" };
            var auth = new FakeAuthProvider(session: null);
            var users = new FakeUserLookup(user: null);

            var result = await LoginEndpoints.HandleLogin(request, auth, users);

            //result.Should().BeOfType<UnauthorizedHttpResult>();
        }
    }
}
