using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Endpoints;
using badgeur_backend.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http.HttpResults;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace badgeur_backend_tests.Endpoints
{
    public class UserEndpointsTests
    {
        private sealed class FakeUserService : UserService
        {
            private readonly long _createUserId;
            private readonly List<UserResponse> _users;
            private readonly UserResponse? _user;
            private readonly UserResponse? _updatedUser;

            public FakeUserService(
                long createUserId = 0,
                List<UserResponse>? users = null,
                UserResponse? user = null,
                UserResponse? updatedUser = null) : base(null!)
            {
                _createUserId = createUserId;
                _users = users ?? new List<UserResponse>();
                _user = user;
                _updatedUser = updatedUser;
            }

            public override async Task<long> CreateUserAsync(CreateUserRequest request)
            {
                return await Task.FromResult(_createUserId);
            }

            public override async Task<List<UserResponse>> GetAllUsersAsync()
            {
                return await Task.FromResult(_users);
            }

            public override async Task<UserResponse?> GetUserByIdAsync(long id)
            {
                return await Task.FromResult(_user);
            }

            public override async Task<UserResponse?> updateUserRoleAsync(long id, long newRoleId)
            {
                return await Task.FromResult(_updatedUser);
            }

            public override async Task<UserResponse?> UpdateUserAsync(long id, UpdateUserRequest updateUserRequest)
            {
                return await Task.FromResult(_updatedUser);
            }

            public override async Task DeleteUserAsync(long id)
            {
                await Task.CompletedTask;
            }

            public override async Task<List<UserResponse>> GetUsersByTeamIdAsync(long teamId)
            {
                return await Task.FromResult(_users);
            }
        }

        private sealed class FakeBadgeLogEventService : BadgeLogEventService
        {
            private readonly UserSummaryResponse _userSummary;

            public FakeBadgeLogEventService(UserSummaryResponse? userSummary = null) : base(null!)
            {
                _userSummary = userSummary ?? new UserSummaryResponse { UserId = 1, Days = new List<UserDayInterval>() };
            }

            public override async Task<UserSummaryResponse> GetUserSummaryAsync(long id)
            {
                return await Task.FromResult(_userSummary);
            }
        }

        #region CreateUser Tests

        [Fact]
        public async Task HandleCreateUser_Returns_Ok_With_UserId_On_Success()
        {
            var request = new CreateUserRequest
            {
                FirstName = "Bobby",
                LastName = "Tester",
                Email = "bobby.tester@primebank.com",
                Telephone = "0123456789",
                RoleId = 1,
                TeamId = 1
            };
            var userService = new FakeUserService(createUserId: 123);

            var result = await UserEndpoints.HandleCreateUser(request, userService);

            result.Should().BeOfType<Ok<long?>>();
            var ok = (Ok<long>)result;
            ok.Value.Should().Be(123);
        }

        #endregion

        #region GetAllUsers Tests

        [Fact]
        public async Task HandleGetAllUsers_Returns_NotFound_When_No_Users_Exist()
        {
            var userService = new FakeUserService(users: new List<UserResponse>());

            var result = await UserEndpoints.HandleGetAllUsers(userService);

            result.Should().BeOfType<NotFound<string>>();
            var notFound = (NotFound<string>)result;
            notFound.Value.Should().Be("No users found.");
        }

        [Fact]
        public async Task HandleGetAllUsers_Returns_Ok_With_UserList_On_Success()
        {
            var users = new List<UserResponse>
            {
                new UserResponse { Id = 1, FirstName = "Bobby", LastName = "Tester", Email = "bobby.tester@primebank.com", Telephone = "0123456789", RoleId = 1, TeamId = 1 },
                new UserResponse { Id = 2, FirstName = "Jane", LastName = "Tester", Email = "jane.tester@primebank.com", Telephone = "9876543210", RoleId = 0, TeamId = 2 }
            };
            var userService = new FakeUserService(users: users);

            var result = await UserEndpoints.HandleGetAllUsers(userService);

            result.Should().BeOfType<Ok<List<UserResponse>>>();
            var ok = (Ok<List<UserResponse>>)result;
            ok.Value.Should().HaveCount(2);
            ok.Value![0].FirstName.Should().Be("Bobby");
        }

        #endregion

        #region GetUserById Tests

        [Fact]
        public async Task HandleGetUserById_Returns_NotFound_When_User_Does_Not_Exist()
        {
            var userService = new FakeUserService(user: null);

            var result = await UserEndpoints.HandleGetUserById(1, userService);

            result.Should().BeOfType<NotFound<string>>();
        }

        [Fact]
        public async Task HandleGetUserById_Returns_Ok_With_User_On_Success()
        {
            var user = new UserResponse { Id = 1, FirstName = "Bobby", LastName = "Tester", Email = "bobby.tester@primebank.com", Telephone = "0123456789", RoleId = 1, TeamId = 1 };
            var userService = new FakeUserService(user: user);

            var result = await UserEndpoints.HandleGetUserById(1, userService);

            result.Should().BeOfType<Ok<UserResponse>>();
            var ok = (Ok<UserResponse>)result;
            ok.Value!.FirstName.Should().Be("Bobby");
        }

        #endregion

        #region UpdateUserRole Tests

        [Fact]
        public async Task HandleUpdateUserRole_Returns_NotFound_When_User_Does_Not_Exist()
        {
            var request = new UpdateUserRoleRequest { NewRoleId = 2 };
            var userService = new FakeUserService(updatedUser: null);

            var result = await UserEndpoints.HandleUpdateUserRole(1, request, userService);

            result.Should().BeOfType<NotFound<string>>();
        }

        [Fact]
        public async Task HandleUpdateUserRole_Returns_Ok_With_UpdatedUser_On_Success()
        {
            var request = new UpdateUserRoleRequest { NewRoleId = 2 };
            var updatedUser = new UserResponse { Id = 1, FirstName = "Bobby", LastName = "Tester", Email = "bobby.tester@primebank.com", Telephone = "0123456789", RoleId = 2, TeamId = 1 };
            var userService = new FakeUserService(updatedUser: updatedUser);

            var result = await UserEndpoints.HandleUpdateUserRole(1, request, userService);

            result.Should().BeOfType<Ok<UserResponse>>();
            var ok = (Ok<UserResponse>)result;
            ok.Value!.RoleId.Should().Be(2);
        }

        #endregion

        #region UpdateUser Tests

        [Fact]
        public async Task HandleUpdateUser_Returns_NotFound_When_User_Does_Not_Exist()
        {
            var request = new UpdateUserRequest { FirstName = "Bobby", LastName = "Tester", Telephone = "0123456789", RoleId = 1, TeamId = 1 };
            var userService = new FakeUserService(updatedUser: null);

            var result = await UserEndpoints.HandleUpdateUser(1, request, userService);

            result.Should().BeOfType<NotFound<string>>();
        }

        [Fact]
        public async Task HandleUpdateUser_Returns_Ok_With_UpdatedUser_On_Success()
        {
            var request = new UpdateUserRequest { FirstName = "Bobby", LastName = "Tester", Telephone = "1234567890", RoleId = 2, TeamId = 3 };
            var updatedUser = new UserResponse { Id = 1, FirstName = "Jane", LastName = "Tester", Email = "jane.tester@primebank.com", Telephone = "1234567890", RoleId = 2, TeamId = 3 };
            var userService = new FakeUserService(updatedUser: updatedUser);

            var result = await UserEndpoints.HandleUpdateUser(1, request, userService);

            result.Should().BeOfType<Ok<UserResponse>>();
            var ok = (Ok<UserResponse>)result;
            ok.Value!.FirstName.Should().Be("Jane");
        }

        #endregion

        #region GetUserSummary Tests

        [Fact]
        public async Task HandleGetUserSummary_Returns_Ok_With_UserSummary()
        {
            var summary = new UserSummaryResponse
            {
                UserId = 1,
                Days = new List<UserDayInterval>
                {
                    new UserDayInterval { Arrival = DateTimeOffset.UtcNow, Departure = DateTimeOffset.UtcNow.AddHours(8) }
                }
            };
            var badgeLogEventService = new FakeBadgeLogEventService(summary);

            var result = await UserEndpoints.HandleGetUserSummary(1, badgeLogEventService);

            result.Should().BeOfType<Ok<UserSummaryResponse>>();
            var ok = (Ok<UserSummaryResponse>)result;
            ok.Value!.UserId.Should().Be(1);
            ok.Value!.Days.Should().HaveCount(1);
        }

        #endregion

        #region DeleteUser Tests

        [Fact]
        public async Task HandleDeleteUser_Returns_NoContent_On_Success()
        {
            var userService = new FakeUserService();

            var result = await UserEndpoints.HandleDeleteUser(1, userService);

            result.Should().BeOfType<NoContent>();
        }

        #endregion

        #region GetUsersByTeamId Tests

        [Fact]
        public async Task HandleGetUsersByTeamId_Returns_NotFound_When_No_Users_Found()
        {
            var userService = new FakeUserService(users: new List<UserResponse>());

            var result = await UserEndpoints.HandleGetUsersByTeamId(1, userService);

            result.Should().BeOfType<NotFound<string>>();
        }

        [Fact]
        public async Task HandleGetUsersByTeamId_Returns_Ok_With_UserList_On_Success()
        {
            var users = new List<UserResponse>
            {
                new UserResponse { Id = 1, FirstName = "Bobby", LastName = "Tester", Email = "bobby.tester@primebank.com", Telephone = "0123456789", RoleId = 1, TeamId = 10 },
                new UserResponse { Id = 2, FirstName = "Jane", LastName = "Tester", Email = "jane.tester@primebank.com", Telephone = "9876543210", RoleId = 0, TeamId = 10 }
            };
            var userService = new FakeUserService(users: users);

            var result = await UserEndpoints.HandleGetUsersByTeamId(10, userService);

            result.Should().BeOfType<Ok<List<UserResponse>>>();
            var ok = (Ok<List<UserResponse>>)result;
            ok.Value.Should().HaveCount(2);
        }

        #endregion
    }
}