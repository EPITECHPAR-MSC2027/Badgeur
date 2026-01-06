using badgeur_backend.Contracts.Responses;
using badgeur_backend.Endpoints;
using badgeur_backend.Models;
using badgeur_backend.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace badgeur_backend_tests.Endpoints
{
    public class UserKPIEndpointsTests
    {
        private sealed class FakeUserKPIService : UserKPIService
        {
            private readonly string _hoursPerDay;
            private readonly string _hoursPerWeek;
            private readonly DateTimeOffset _arrivalTime;
            private readonly DateTimeOffset _departureTime;
            private readonly UserKPI? _userKPI;

            public FakeUserKPIService(
                string hoursPerDay = "08:00",
                string hoursPerWeek = "40:00",
                DateTimeOffset? arrivalTime = null,
                DateTimeOffset? departureTime = null,
                UserKPI? userKPI = null) : base(null!, null!)
            {
                _hoursPerDay = hoursPerDay;
                _hoursPerWeek = hoursPerWeek;
                _arrivalTime = arrivalTime ?? DateTimeOffset.MinValue;
                _departureTime = departureTime ?? DateTimeOffset.MinValue;
                _userKPI = userKPI;
            }

            public override async Task<string> CalculateRollingAverageWorkingHours(long userId, Period period)
            {
                return await Task.FromResult(_hoursPerDay);
            }

            public override async Task<string> CalculateWeeklyWorkingHours(long userId)
            {
                return await Task.FromResult(_hoursPerWeek);
            }

            public override async Task<DateTimeOffset> CalculateRollingAverageArrivalTime(long userId, Period period)
            {
                return await Task.FromResult(_arrivalTime);
            }

            public override async Task<DateTimeOffset> CalculateRollingAverageDepartureTime(long userId, Period period)
            {
                return await Task.FromResult(_departureTime);
            }

            public override async Task<UserKPI> CalculateAllUserKPIs(long userId)
            {
                return await Task.FromResult(_userKPI)!;
            }
        }

        private sealed class FakeBadgeLogEventService : BadgeLogEventService
        {
            private readonly List<BadgeLogEventResponse> _events;

            public FakeBadgeLogEventService(List<BadgeLogEventResponse>? events = null) : base(null!)
            {
                _events = events ?? new List<BadgeLogEventResponse>();
            }

            public override async Task<List<BadgeLogEventResponse>> GetBadgeLogEventsByUserIdAsync(long userId)
            {
                return await Task.FromResult(_events);
            }
        }

        private sealed class FakeUserService : UserService
        {
            private readonly UserResponse? _user;

            public FakeUserService(UserResponse? user = null) : base(null!)
            {
                _user = user;
            }

            public override async Task<UserResponse?> GetUserByEmailAsync(string email)
            {
                return await Task.FromResult(_user);
            }
        }

        private static HttpContext CreateHttpContext(
            Supabase.Gotrue.User? authenticatedUser,
            UserService? userService = null)
        {
            var context = new DefaultHttpContext();

            if (authenticatedUser != null)
            {
                context.Items["User"] = authenticatedUser;
            }

            if (userService != null)
            {
                var services = new ServiceCollection();
                services.AddScoped<UserService>(_ => userService);
                context.RequestServices = services.BuildServiceProvider();
            }

            return context;
        }

        private static Supabase.Gotrue.User CreateAuthenticatedUser(string email = "test@example.com")
        {
            return new Supabase.Gotrue.User { Email = email };
        }

        #region GET /reports/me Tests

        [Fact]
        public async Task GetMyKPIs_Returns_Unauthorized_When_No_Authenticated_User()
        {
            var userKPIService = new FakeUserKPIService();
            var badgeLogEventService = new FakeBadgeLogEventService();
            var context = CreateHttpContext(authenticatedUser: null);

            var result = await UserKPIEndpoints.GetMyKPIs(userKPIService, badgeLogEventService, context);

            result.Should().BeOfType<UnauthorizedHttpResult>();
        }

        [Fact]
        public async Task GetMyKPIs_Returns_Unauthorized_When_User_Not_Found_In_Database()
        {
            var userKPIService = new FakeUserKPIService();
            var badgeLogEventService = new FakeBadgeLogEventService();
            var userService = new FakeUserService(user: null);
            var authenticatedUser = CreateAuthenticatedUser();
            var context = CreateHttpContext(authenticatedUser, userService);

            var result = await UserKPIEndpoints.GetMyKPIs(userKPIService, badgeLogEventService, context);

            result.Should().BeOfType<UnauthorizedHttpResult>();
        }

        [Fact]
        public async Task GetMyKPIs_Returns_Ok_With_KPIs_When_User_Authenticated()
        {
            var connectedUser = new UserResponse
            {
                Id = 1,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Telephone = "0123456789",
                RoleId = 1,
                TeamId = 1
            };

            var events = new List<BadgeLogEventResponse>
            {
                new BadgeLogEventResponse { Id = 1, UserId = 1, BadgedAt = DateTime.UtcNow.AddDays(-13).AddHours(8) },
                new BadgeLogEventResponse { Id = 2, UserId = 1, BadgedAt = DateTime.UtcNow.AddDays(-13).AddHours(17) },
                new BadgeLogEventResponse { Id = 3, UserId = 1, BadgedAt = DateTime.UtcNow.AddDays(-12).AddHours(9) },
                new BadgeLogEventResponse { Id = 4, UserId = 1, BadgedAt = DateTime.UtcNow.AddDays(-12).AddHours(18) }
            };

            var userKPIService = new FakeUserKPIService(hoursPerDay: "08:30", hoursPerWeek: "42:30");
            var badgeLogEventService = new FakeBadgeLogEventService(events);
            var userService = new FakeUserService(connectedUser);
            var authenticatedUser = CreateAuthenticatedUser("john.doe@example.com");
            var context = CreateHttpContext(authenticatedUser, userService);

            var result = await UserKPIEndpoints.GetMyKPIs(userKPIService, badgeLogEventService, context);

            result.Should().BeOfType<Ok<UserKPIResponse>>();
            var okResult = result as Ok<UserKPIResponse>;
            okResult!.Value.Should().NotBeNull();
            okResult.Value!.UserId.Should().Be(1);
            okResult.Value.HoursPerDay.Should().Be("08:30");
            okResult.Value.HoursPerWeek.Should().Be("42:30");
            okResult.Value.TotalDays.Should().Be(14);
        }

        [Fact]
        public async Task GetMyKPIs_Calculates_Presence_Rate_Correctly()
        {
            var connectedUser = new UserResponse
            {
                Id = 1,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Telephone = "0123456789",
                RoleId = 1,
                TeamId = 1
            };

            // 7 working days out of 14 = 50% presence rate
            var events = new List<BadgeLogEventResponse>();
            for (int i = 0; i < 7; i++)
            {
                events.Add(new BadgeLogEventResponse { Id = i * 2 + 1, UserId = 1, BadgedAt = DateTime.UtcNow.AddDays(-13 + i).AddHours(10) });
                events.Add(new BadgeLogEventResponse { Id = i * 2 + 2, UserId = 1, BadgedAt = DateTime.UtcNow.AddDays(-13 + i).AddHours(10) });
            }

            var userKPIService = new FakeUserKPIService();
            var badgeLogEventService = new FakeBadgeLogEventService(events);
            var userService = new FakeUserService(connectedUser);
            var authenticatedUser = CreateAuthenticatedUser("john.doe@example.com");
            var context = CreateHttpContext(authenticatedUser, userService);

            var result = await UserKPIEndpoints.GetMyKPIs(userKPIService, badgeLogEventService, context);

            result.Should().BeOfType<Ok<UserKPIResponse>>();
            var okResult = result as Ok<UserKPIResponse>;
            okResult!.Value!.PresenceRate.Should().Be(50.0);
        }

        [Fact]
        public async Task GetMyKPIs_Returns_Zero_Working_Days_When_No_Events()
        {
            var connectedUser = new UserResponse
            {
                Id = 1,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Telephone = "0123456789",
                RoleId = 1,
                TeamId = 1
            };

            var userKPIService = new FakeUserKPIService();
            var badgeLogEventService = new FakeBadgeLogEventService(new List<BadgeLogEventResponse>());
            var userService = new FakeUserService(connectedUser);
            var authenticatedUser = CreateAuthenticatedUser("john.doe@example.com");
            var context = CreateHttpContext(authenticatedUser, userService);

            var result = await UserKPIEndpoints.GetMyKPIs(userKPIService, badgeLogEventService, context);

            result.Should().BeOfType<Ok<UserKPIResponse>>();
            var okResult = result as Ok<UserKPIResponse>;
            okResult!.Value!.WorkingDays.Should().Be(0);
            okResult.Value.PresenceRate.Should().Be(0.0);
        }

        [Fact]
        public async Task GetMyKPIs_Ignores_Days_With_Less_Than_Two_Badge_Events()
        {
            var connectedUser = new UserResponse
            {
                Id = 1,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Telephone = "0123456789",
                RoleId = 1,
                TeamId = 1
            };

            var events = new List<BadgeLogEventResponse>
            {
                // Valid day (2 events)
                new BadgeLogEventResponse { Id = 1, UserId = 1, BadgedAt = DateTime.UtcNow.AddDays(-13).AddHours(8) },
                new BadgeLogEventResponse { Id = 2, UserId = 1, BadgedAt = DateTime.UtcNow.AddDays(-13).AddHours(17) },
                // Invalid day (only 1 event)
                new BadgeLogEventResponse { Id = 3, UserId = 1, BadgedAt = DateTime.UtcNow.AddDays(-12).AddHours(9) }
            };

            var userKPIService = new FakeUserKPIService();
            var badgeLogEventService = new FakeBadgeLogEventService(events);
            var userService = new FakeUserService(connectedUser);
            var authenticatedUser = CreateAuthenticatedUser("john.doe@example.com");
            var context = CreateHttpContext(authenticatedUser, userService);

            var result = await UserKPIEndpoints.GetMyKPIs(userKPIService, badgeLogEventService, context);

            result.Should().BeOfType<Ok<UserKPIResponse>>();
            var okResult = result as Ok<UserKPIResponse>;
            okResult!.Value!.WorkingDays.Should().Be(1); // Only the day with 2 events counts
        }

        #endregion

        #region GET /reports/{userId} Tests

        [Fact]
        public async Task GetUserKPIs_Returns_Unauthorized_When_No_Authenticated_User()
        {
            var userKPIService = new FakeUserKPIService();
            var context = CreateHttpContext(authenticatedUser: null);

            var result = await UserKPIEndpoints.GetUserKPIs(1, userKPIService, context);

            result.Should().BeOfType<UnauthorizedHttpResult>();
        }

        [Fact]
        public async Task GetUserKPIs_Returns_Unauthorized_When_User_Not_Found_In_Database()
        {
            var userKPIService = new FakeUserKPIService();
            var userService = new FakeUserService(user: null);
            var authenticatedUser = CreateAuthenticatedUser();
            var context = CreateHttpContext(authenticatedUser, userService);

            var result = await UserKPIEndpoints.GetUserKPIs(1, userKPIService, context);

            result.Should().BeOfType<UnauthorizedHttpResult>();
        }

        [Fact]
        public async Task GetUserKPIs_Returns_Forbidden_When_User_Accesses_Another_Users_KPIs()
        {
            var connectedUser = new UserResponse
            {
                Id = 1,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Telephone = "0123456789",
                RoleId = 1,
                TeamId = 1
            };

            var userKPIService = new FakeUserKPIService();
            var userService = new FakeUserService(connectedUser);
            var authenticatedUser = CreateAuthenticatedUser("john.doe@example.com");
            var context = CreateHttpContext(authenticatedUser, userService);

            var result = await UserKPIEndpoints.GetUserKPIs(2, userKPIService, context); // Trying to access userId 2

            var forbidResult = result as ForbidHttpResult;
            forbidResult.Should().NotBeNull();
        }

        [Fact]
        public async Task GetUserKPIs_Returns_NotFound_When_KPI_Calculation_Fails()
        {
            var connectedUser = new UserResponse
            {
                Id = 1,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Telephone = "0123456789",
                RoleId = 1,
                TeamId = 1
            };

            var userKPIService = new FakeUserKPIService(userKPI: null);
            var userService = new FakeUserService(connectedUser);
            var authenticatedUser = CreateAuthenticatedUser("john.doe@example.com");
            var context = CreateHttpContext(authenticatedUser, userService);

            var result = await UserKPIEndpoints.GetUserKPIs(1, userKPIService, context);

            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("Failed to calcuate KPIs. Contact an administrator.");
        }

        [Fact]
        public async Task GetUserKPIs_Returns_Ok_With_KPIs_When_User_Accesses_Own_KPIs()
        {
            var connectedUser = new UserResponse
            {
                Id = 1,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Telephone = "0123456789",
                RoleId = 1,
                TeamId = 1
            };

            var userKPI = new UserKPI
            {
                Id = 100,
                UserId = 1,
                Raat14 = new DateTimeOffset(DateTime.UtcNow.Date.AddHours(9), TimeSpan.Zero),
                Raat28 = new DateTimeOffset(DateTime.UtcNow.Date.AddHours(9), TimeSpan.Zero),
                Radt14 = new DateTimeOffset(DateTime.UtcNow.Date.AddHours(18), TimeSpan.Zero),
                Radt28 = new DateTimeOffset(DateTime.UtcNow.Date.AddHours(18), TimeSpan.Zero),
                Raw14 = "08:30",
                Raw28 = "08:45"
            };

            var arrivalTime = new DateTimeOffset(DateTime.UtcNow.Date.AddHours(8), TimeSpan.Zero);
            var departureTime = new DateTimeOffset(DateTime.UtcNow.Date.AddHours(17), TimeSpan.Zero);

            var userKPIService = new FakeUserKPIService(
                hoursPerDay: "08:15",
                arrivalTime: arrivalTime,
                departureTime: departureTime,
                userKPI: userKPI);
            var userService = new FakeUserService(connectedUser);
            var authenticatedUser = CreateAuthenticatedUser("john.doe@example.com");
            var context = CreateHttpContext(authenticatedUser, userService);

            var result = await UserKPIEndpoints.GetUserKPIs(1, userKPIService, context);

            result.Should().BeOfType<Ok<UserKPIResponse>>();
            var okResult = result as Ok<UserKPIResponse>;
            okResult!.Value.Should().NotBeNull();
            okResult.Value!.Id.Should().Be(100);
            okResult.Value.UserId.Should().Be(1);
            okResult.Value.Raw14.Should().Be("08:30");
            okResult.Value.Raw28.Should().Be("08:45");
            okResult.Value.Raat7.Should().Be(arrivalTime);
            okResult.Value.Radt7.Should().Be(departureTime);
            okResult.Value.Raw7.Should().Be("08:15");
        }

        [Fact]
        public async Task GetUserKPIs_Includes_All_Legacy_Fields()
        {
            var connectedUser = new UserResponse
            {
                Id = 1,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Telephone = "0123456789",
                RoleId = 1,
                TeamId = 1
            };

            var userKPI = new UserKPI
            {
                Id = 100,
                UserId = 1,
                Raat14 = new DateTimeOffset(DateTime.UtcNow.Date.AddHours(9), TimeSpan.Zero),
                Raat28 = new DateTimeOffset(DateTime.UtcNow.Date.AddHours(9).AddMinutes(15), TimeSpan.Zero),
                Radt14 = new DateTimeOffset(DateTime.UtcNow.Date.AddHours(18), TimeSpan.Zero),
                Radt28 = new DateTimeOffset(DateTime.UtcNow.Date.AddHours(18).AddMinutes(30), TimeSpan.Zero),
                Raw14 = "08:30",
                Raw28 = "08:45"
            };

            var userKPIService = new FakeUserKPIService(userKPI: userKPI);
            var userService = new FakeUserService(connectedUser);
            var authenticatedUser = CreateAuthenticatedUser("john.doe@example.com");
            var context = CreateHttpContext(authenticatedUser, userService);

            var result = await UserKPIEndpoints.GetUserKPIs(1, userKPIService, context);

            result.Should().BeOfType<Ok<UserKPIResponse>>();
            var okResult = result as Ok<UserKPIResponse>;
            okResult!.Value!.Raat14.Should().Be(userKPI.Raat14);
            okResult.Value.Raat28.Should().Be(userKPI.Raat28);
            okResult.Value.Radt14.Should().Be(userKPI.Radt14);
            okResult.Value.Radt28.Should().Be(userKPI.Radt28);
            okResult.Value.Raw14.Should().Be(userKPI.Raw14);
            okResult.Value.Raw28.Should().Be(userKPI.Raw28);
        }

        #endregion
    }
}