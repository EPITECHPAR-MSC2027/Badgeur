using badgeur_backend.Contracts.Requests;
using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Endpoints;
using badgeur_backend.Services;
using badgeur_backend.Services.Auth;
using FluentAssertions;
using Microsoft.AspNetCore.Http.HttpResults;
using Supabase.Gotrue;
using System;
using System.Threading.Tasks;

namespace badgeur_backend_tests.Endpoints
{
    public class RegistrationEndpointsTests
    {
        private sealed class FakeAuthRegistration : IAuthRegistration
        {
            private readonly Session? _session;
            private readonly bool _throwException;

            public FakeAuthRegistration(Session? session = null, bool throwException = false)
            {
                _session = session;
                _throwException = throwException;
            }

            public Task<Session?> SignUp(string email, string password, string firstName, string lastName)
            {
                if (_throwException)
                    throw new Exception("Auth service unavailable");

                return Task.FromResult(_session);
            }
        }

        private sealed class FakeUserService : UserService
        {
            private readonly long _createUserId;
            private readonly UserResponse? _user;

            public FakeUserService(
                long createUserId = 0,
                UserResponse? user = null) : base(null!)
            {
                _createUserId = createUserId;
                _user = user;
            }

            public override async Task<long> CreateUserAsync(CreateUserRequest request)
            {
                return await Task.FromResult(_createUserId);
            }

            public override async Task<UserResponse?> GetUserByIdAsync(long id)
            {
                return await Task.FromResult(_user);
            }
        }

        private static Session CreateSession(string accessToken = "access_token_123", string refreshToken = "refresh_token_456")
        {
            return new Session
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };
        }

        #region POST /register Tests

        [Fact]
        public async Task HandleRegistration_Returns_Ok_With_RegistrationResponse_On_Success()
        {
            // Arrange
            var request = new RegistrationRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Telephone = "0123456789",
                Password = "SecurePassword123!"
            };

            var session = CreateSession("access_token_abc", "refresh_token_xyz");
            var authRegistration = new FakeAuthRegistration(session);

            var userResponse = new UserResponse
            {
                Id = 100,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Telephone = "0123456789",
                RoleId = 2,
                TeamId = 5
            };
            var userService = new FakeUserService(createUserId: 100, user: userResponse);

            // Act
            var result = await RegistrationEndpoints.HandleRegistration(request, authRegistration, userService);

            // Assert
            result.Should().BeOfType<Ok<RegistrationResponse>>();
            var okResult = result as Ok<RegistrationResponse>;
            okResult!.Value.Should().NotBeNull();
            okResult.Value!.AccessToken.Should().Be("access_token_abc");
            okResult.Value.RefreshToken.Should().Be("refresh_token_xyz");
            okResult.Value.UserId.Should().Be(100);
            okResult.Value.RoleId.Should().Be(2);
            okResult.Value.FirstName.Should().Be("John");
            okResult.Value.LastName.Should().Be("Doe");
        }

        [Fact]
        public async Task HandleRegistration_Returns_BadRequest_When_Auth_SignUp_Returns_Null()
        {
            // Arrange
            var request = new RegistrationRequest
            {
                FirstName = "Jane",
                LastName = "Smith",
                Email = "jane.smith@example.com",
                Telephone = "9876543210",
                Password = "password123"
            };

            var authRegistration = new FakeAuthRegistration(session: null);
            var userService = new FakeUserService();

            // Act
            var result = await RegistrationEndpoints.HandleRegistration(request, authRegistration, userService);

            // Assert
            result.Should().BeOfType<BadRequest<string>>();
            var badRequestResult = result as BadRequest<string>;
            badRequestResult!.Value.Should().Be("Registration failed. (Auth)");
        }

        [Fact]
        public async Task HandleRegistration_Returns_BadRequest_When_AccessToken_Is_Empty()
        {
            // Arrange
            var request = new RegistrationRequest
            {
                FirstName = "Bob",
                LastName = "Johnson",
                Email = "bob.johnson@example.com",
                Telephone = "1234567890",
                Password = "password456"
            };

            var session = new Session
            {
                AccessToken = "",
                RefreshToken = "refresh_token"
            };
            var authRegistration = new FakeAuthRegistration(session);
            var userService = new FakeUserService();

            // Act
            var result = await RegistrationEndpoints.HandleRegistration(request, authRegistration, userService);

            // Assert
            result.Should().BeOfType<BadRequest<string>>();
            var badRequestResult = result as BadRequest<string>;
            badRequestResult!.Value.Should().Be("Registration failed. (Auth)");
        }

        [Fact]
        public async Task HandleRegistration_Returns_BadRequest_When_Auth_Throws_Exception()
        {
            // Arrange
            var request = new RegistrationRequest
            {
                FirstName = "Alice",
                LastName = "Brown",
                Email = "alice.brown@example.com",
                Telephone = "5555555555",
                Password = "password789"
            };

            var authRegistration = new FakeAuthRegistration(throwException: true);
            var userService = new FakeUserService();

            // Act
            var result = await RegistrationEndpoints.HandleRegistration(request, authRegistration, userService);

            // Assert
            result.Should().BeOfType<BadRequest<string>>();
            var badRequestResult = result as BadRequest<string>;
            badRequestResult!.Value.Should().Be("Registration failed. (Auth)");
        }

        [Fact]
        public async Task HandleRegistration_Returns_BadRequest_When_CreateUser_Returns_Zero()
        {
            // Arrange
            var request = new RegistrationRequest
            {
                FirstName = "Charlie",
                LastName = "Wilson",
                Email = "charlie.wilson@example.com",
                Telephone = "4444444444",
                Password = "securePass123"
            };

            var session = CreateSession();
            var authRegistration = new FakeAuthRegistration(session);
            var userService = new FakeUserService(createUserId: 0); // User creation fails

            // Act
            var result = await RegistrationEndpoints.HandleRegistration(request, authRegistration, userService);

            // Assert
            result.Should().BeOfType<BadRequest<string>>();
            var badRequestResult = result as BadRequest<string>;
            badRequestResult!.Value.Should().Be("Registration failed. (Role)");
        }

        [Fact]
        public async Task HandleRegistration_Returns_BadRequest_When_GetUserById_Returns_Null()
        {
            // Arrange
            var request = new RegistrationRequest
            {
                FirstName = "David",
                LastName = "Martinez",
                Email = "david.martinez@example.com",
                Telephone = "3333333333",
                Password = "myPassword321"
            };

            var session = CreateSession();
            var authRegistration = new FakeAuthRegistration(session);
            var userService = new FakeUserService(createUserId: 50, user: null); // User retrieval fails

            // Act
            var result = await RegistrationEndpoints.HandleRegistration(request, authRegistration, userService);

            // Assert
            result.Should().BeOfType<BadRequest<string>>();
            var badRequestResult = result as BadRequest<string>;
            badRequestResult!.Value.Should().Be("Registration failed. (User retrieval)");
        }

        [Fact]
        public async Task HandleRegistration_Creates_User_With_All_Required_Fields()
        {
            // Arrange
            var request = new RegistrationRequest
            {
                FirstName = "Emma",
                LastName = "Davis",
                Email = "emma.davis@example.com",
                Telephone = "0987654321",
                Password = "StrongPass999!"
            };

            var session = CreateSession();
            var authRegistration = new FakeAuthRegistration(session);

            var userResponse = new UserResponse
            {
                Id = 200,
                FirstName = "Emma",
                LastName = "Davis",
                Email = "emma.davis@example.com",
                Telephone = "0987654321",
                RoleId = 1,
                TeamId = 3
            };
            var userService = new FakeUserService(createUserId: 200, user: userResponse);

            // Act
            var result = await RegistrationEndpoints.HandleRegistration(request, authRegistration, userService);

            // Assert
            result.Should().BeOfType<Ok<RegistrationResponse>>();
            var okResult = result as Ok<RegistrationResponse>;
            okResult!.Value!.FirstName.Should().Be("Emma");
            okResult.Value.LastName.Should().Be("Davis");
            okResult.Value.UserId.Should().Be(200);
        }

        [Fact]
        public async Task HandleRegistration_Returns_Valid_Tokens_On_Success()
        {
            // Arrange
            var request = new RegistrationRequest
            {
                FirstName = "Frank",
                LastName = "Miller",
                Email = "frank.miller@example.com",
                Telephone = "2222222222",
                Password = "Password2024!"
            };

            var session = CreateSession("my_access_token", "my_refresh_token");
            var authRegistration = new FakeAuthRegistration(session);

            var userResponse = new UserResponse
            {
                Id = 300,
                FirstName = "Frank",
                LastName = "Miller",
                Email = "frank.miller@example.com",
                Telephone = "2222222222",
                RoleId = 3,
                TeamId = 1
            };
            var userService = new FakeUserService(createUserId: 300, user: userResponse);

            // Act
            var result = await RegistrationEndpoints.HandleRegistration(request, authRegistration, userService);

            // Assert
            result.Should().BeOfType<Ok<RegistrationResponse>>();
            var okResult = result as Ok<RegistrationResponse>;
            okResult!.Value!.AccessToken.Should().NotBeNullOrEmpty();
            okResult.Value.RefreshToken.Should().NotBeNullOrEmpty();
            okResult.Value.AccessToken.Should().Be("my_access_token");
            okResult.Value.RefreshToken.Should().Be("my_refresh_token");
        }

        [Fact]
        public async Task HandleRegistration_Handles_Empty_RefreshToken()
        {
            // Arrange
            var request = new RegistrationRequest
            {
                FirstName = "Grace",
                LastName = "Lee",
                Email = "grace.lee@example.com",
                Telephone = "1111111111",
                Password = "GracefulPass!"
            };

            var session = new Session
            {
                AccessToken = "valid_access_token",
                RefreshToken = null // Null refresh token
            };
            var authRegistration = new FakeAuthRegistration(session);

            var userResponse = new UserResponse
            {
                Id = 400,
                FirstName = "Grace",
                LastName = "Lee",
                Email = "grace.lee@example.com",
                Telephone = "1111111111",
                RoleId = 2,
                TeamId = 4
            };
            var userService = new FakeUserService(createUserId: 400, user: userResponse);

            // Act
            var result = await RegistrationEndpoints.HandleRegistration(request, authRegistration, userService);

            // Assert
            result.Should().BeOfType<Ok<RegistrationResponse>>();
            var okResult = result as Ok<RegistrationResponse>;
            okResult!.Value!.RefreshToken.Should().Be(string.Empty); // Should handle null gracefully
        }

        #endregion
    }
}