using badgeur_backend.Contracts.Requests;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Endpoints;
using badgeur_backend.Services;
using badgeur_backend.Services.Auth;
using FluentAssertions;
using Microsoft.AspNetCore.Http.HttpResults;


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
            var request = new LoginRequest { Email = "bobby.tester@primebank.com", Password = "wrongPassword" };
            var auth = new FakeAuthProvider(session: null);
            var users = new FakeUserLookup(user: null);

            var result = await LoginEndpoints.HandleLogin(request, auth, users);

            result.Should().BeOfType<UnauthorizedHttpResult>();
        }

        [Fact]
        public async Task HandleLogin_Returns_Unauthorized_When_AccessToken_Empty()
        {
            var request = new LoginRequest { Email = "bobby.tester@primebank.com", Password = "password" };
            var auth = new FakeAuthProvider(new AuthSession("", "refreshToken", "bobby.tester@primebank.com"));
            var users = new FakeUserLookup(user: null);

            var result = await LoginEndpoints.HandleLogin(request, auth, users);

            result.Should().BeOfType<UnauthorizedHttpResult>();
        }

        [Fact]
        public async Task HandleLogin_Returns_Ok_With_LoginResponse_On_Success()
        {
            var request = new LoginRequest { Email = "bobby.tester@primebank.com", Password = "password" };
            var auth = new FakeAuthProvider(new AuthSession("accessToken", "refreshToken", "bobby.tester@primebank.com"));
            var users = new FakeUserLookup(new UserResponse
            {
                Id = 1,
                FirstName = "Bobby",
                LastName = "Tester",
                Email = "bobby.tester@primebank.com",
                Telephone = "01 23 45 67 89 10",
                RoleId = 1,
                TeamId = 10
            });

            var result = await LoginEndpoints.HandleLogin(request, auth, users);

            result.Should().BeOfType<Ok<LoginResponse>>();
            var ok = (Ok<LoginResponse>)result;

            ok.Value.Should().NotBe(null);
            ok.Value!.AccessToken.Should().Be("accessToken");
            ok.Value!.RefreshToken.Should().Be("refreshToken");
            ok.Value!.UserId.Should().Be(1);
            ok.Value!.RoleId.Should().Be(1);
            ok.Value!.FirstName.Should().Be("Bobby");
            ok.Value!.LastName.Should().Be("Tester");
            ok.Value!.Email.Should().Be("bobby.tester@primebank.com");

        }
    }
}
