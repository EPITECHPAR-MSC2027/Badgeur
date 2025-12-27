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
    public class ClocksEndpointsTests
    {
        private sealed class FakeClocksService : ClocksService
        {
            private readonly ClocksResponse? _clocksResponse;
            private readonly List<ClocksResponse> _clocksList;
            private readonly ClocksResponse? _updatedClocks;

            public FakeClocksService(
                ClocksResponse? clocksResponse = null,
                List<ClocksResponse>? clocksList = null,
                ClocksResponse? updatedClocks = null) : base(null!)
            {
                _clocksResponse = clocksResponse;
                _clocksList = clocksList ?? new List<ClocksResponse>();
                _updatedClocks = updatedClocks;
            }

            public override async Task<ClocksResponse> CreateClocksAsync(CreateClocksRequest request)
            {
                return await Task.FromResult(_clocksResponse)!;
            }

            public override async Task<List<ClocksResponse>> GetAllClocksAsync()
            {
                return await Task.FromResult(_clocksList);
            }

            public override async Task<ClocksResponse?> GetClocksByIdAsync(long id)
            {
                return await Task.FromResult(_clocksResponse);
            }

            public override async Task<List<ClocksResponse>> GetAllClocksByUserIdAsync(long userId)
            {
                return await Task.FromResult(_clocksList);
            }

            public override async Task<ClocksResponse> UpdateClocksAsync(long id, UpdateClocksRequest updateClocksRequest)
            {
                return await Task.FromResult(_updatedClocks)!;
            }

            public override async Task DeleteClocksAsync(long id)
            {
                await Task.CompletedTask;
            }
        }

        #region POST /clocks Tests

        [Fact]
        public async Task HandleCreateClocks_Returns_BadRequest_When_Creation_Fails()
        {
            var request = new CreateClocksRequest
            {
                UserId = 1,
                Date = DateTime.UtcNow.Date,
                TimeArrivedAt = DateTimeOffset.UtcNow.AddHours(-8),
                TimeDepartedAt = DateTimeOffset.UtcNow
            };

            var clocksService = new FakeClocksService(clocksResponse: null);

            var result = await ClockEndpoints.HandleCreateClocks(request, clocksService);

            result.Should().BeOfType<BadRequest<string>>();
            var badRequestResult = result as BadRequest<string>;
            badRequestResult!.Value.Should().Be("Failed to create a new clocks entity.");
        }

        [Fact]
        public async Task HandleCreateClocks_Returns_Ok_With_ClocksResponse_When_Creation_Succeeds()
        {
            var request = new CreateClocksRequest
            {
                UserId = 1,
                Date = DateTime.UtcNow.Date,
                TimeArrivedAt = new DateTimeOffset(2024, 1, 15, 9, 0, 0, TimeSpan.Zero),
                TimeDepartedAt = new DateTimeOffset(2024, 1, 15, 17, 30, 0, TimeSpan.Zero)
            };

            var expectedResponse = new ClocksResponse
            {
                Id = 100,
                UserId = 1,
                Date = request.Date,
                TimeArrivedAt = request.TimeArrivedAt,
                TimeDepartedAt = request.TimeDepartedAt
            };

            var clocksService = new FakeClocksService(clocksResponse: expectedResponse);

            var result = await ClockEndpoints.HandleCreateClocks(request, clocksService);

            result.Should().BeOfType<Ok<ClocksResponse>>();
            var okResult = result as Ok<ClocksResponse>;
            okResult!.Value.Should().NotBeNull();
            okResult.Value!.Id.Should().Be(100);
            okResult.Value.UserId.Should().Be(1);
            okResult.Value.Date.Should().Be(request.Date);
            okResult.Value.TimeArrivedAt.Should().Be(request.TimeArrivedAt);
            okResult.Value.TimeDepartedAt.Should().Be(request.TimeDepartedAt);
        }

        #endregion

        #region GET /clocks Tests

        [Fact]
        public async Task HandleGetAllClocks_Returns_NotFound_When_No_Clocks_Exist()
        {
            var clocksService = new FakeClocksService(clocksList: new List<ClocksResponse>());

            var result = await ClockEndpoints.HandleGetAllClocks(clocksService);

            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("No clock entities found.");
        }

        [Fact]
        public async Task HandleGetAllClocks_Returns_Ok_With_Clocks_List_When_Clocks_Exist()
        {
            var clocksList = new List<ClocksResponse>
            {
                new ClocksResponse
                {
                    Id = 1,
                    UserId = 10,
                    Date = new DateTime(2024, 1, 10),
                    TimeArrivedAt = new DateTimeOffset(2024, 1, 10, 9, 0, 0, TimeSpan.Zero),
                    TimeDepartedAt = new DateTimeOffset(2024, 1, 10, 17, 0, 0, TimeSpan.Zero)
                },
                new ClocksResponse
                {
                    Id = 2,
                    UserId = 10,
                    Date = new DateTime(2024, 1, 11),
                    TimeArrivedAt = new DateTimeOffset(2024, 1, 11, 8, 30, 0, TimeSpan.Zero),
                    TimeDepartedAt = new DateTimeOffset(2024, 1, 11, 16, 30, 0, TimeSpan.Zero)
                }
            };

            var clocksService = new FakeClocksService(clocksList: clocksList);

            var result = await ClockEndpoints.HandleGetAllClocks(clocksService);

            result.Should().BeOfType<Ok<List<ClocksResponse>>>();
            var okResult = result as Ok<List<ClocksResponse>>;
            okResult!.Value.Should().NotBeNull();
            okResult.Value!.Should().HaveCount(2);
        }

        #endregion

        #region GET /clocks/{id} Tests

        [Fact]
        public async Task HandleGetClocksById_Returns_NotFound_When_Clock_Does_Not_Exist()
        {
            var clocksService = new FakeClocksService(clocksResponse: null);

            var result = await ClockEndpoints.HandleGetClocksById(999, clocksService);

            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("Clock entity was not found.");
        }

        [Fact]
        public async Task HandleGetClocksById_Returns_Ok_With_Clock_When_Clock_Exists()
        {
            var expectedClock = new ClocksResponse
            {
                Id = 42,
                UserId = 7,
                Date = new DateTime(2024, 1, 25),
                TimeArrivedAt = new DateTimeOffset(2024, 1, 25, 8, 0, 0, TimeSpan.Zero),
                TimeDepartedAt = new DateTimeOffset(2024, 1, 25, 16, 0, 0, TimeSpan.Zero)
            };

            var clocksService = new FakeClocksService(clocksResponse: expectedClock);

            var result = await ClockEndpoints.HandleGetClocksById(42, clocksService);

            result.Should().BeOfType<Ok<ClocksResponse>>();
            var okResult = result as Ok<ClocksResponse>;
            okResult!.Value.Should().NotBeNull();
            okResult.Value!.Id.Should().Be(42);
            okResult.Value.UserId.Should().Be(7);
        }

        #endregion

        #region GET /clocks/user/{userId} Tests

        [Fact]
        public async Task HandleGetAllClocksByUserId_Returns_NotFound_When_No_Clocks_For_User()
        {
            var clocksService = new FakeClocksService(clocksList: new List<ClocksResponse>());

            var result = await ClockEndpoints.HandleGetAllClocksByUserId(999, clocksService);

            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("No clock entities found for this user.");
        }

        [Fact]
        public async Task HandleGetAllClocksByUserId_Returns_Ok_With_Clocks_When_Found()
        {
            var clocksList = new List<ClocksResponse>
            {
                new ClocksResponse
                {
                    Id = 1,
                    UserId = 5,
                    Date = new DateTime(2024, 1, 10),
                    TimeArrivedAt = new DateTimeOffset(2024, 1, 10, 9, 0, 0, TimeSpan.Zero),
                    TimeDepartedAt = new DateTimeOffset(2024, 1, 10, 17, 0, 0, TimeSpan.Zero)
                },
                new ClocksResponse
                {
                    Id = 2,
                    UserId = 5,
                    Date = new DateTime(2024, 1, 11),
                    TimeArrivedAt = new DateTimeOffset(2024, 1, 11, 8, 30, 0, TimeSpan.Zero),
                    TimeDepartedAt = new DateTimeOffset(2024, 1, 11, 16, 30, 0, TimeSpan.Zero)
                }
            };

            var clocksService = new FakeClocksService(clocksList: clocksList);

            var result = await ClockEndpoints.HandleGetAllClocksByUserId(5, clocksService);

            result.Should().BeOfType<Ok<List<ClocksResponse>>>();
            var okResult = result as Ok<List<ClocksResponse>>;
            okResult!.Value.Should().HaveCount(2);
        }

        #endregion

        #region PUT /clocks/{id} Tests

        [Fact]
        public async Task HandleUpdateClocks_Returns_NotFound_When_Clock_Does_Not_Exist()
        {
            var updateRequest = new UpdateClocksRequest
            {
                UserId = 1,
                Date = DateTime.UtcNow.Date,
                TimeArrivedAt = DateTimeOffset.UtcNow.AddHours(-8),
                TimeDepartedAt = DateTimeOffset.UtcNow
            };

            var clocksService = new FakeClocksService(updatedClocks: null);

            var result = await ClockEndpoints.HandleUpdateClocks(999, updateRequest, clocksService);

            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("Clock entity not found.");
        }

        [Fact]
        public async Task HandleUpdateClocks_Returns_Ok_With_Updated_Clock_On_Success()
        {
            var updateRequest = new UpdateClocksRequest
            {
                UserId = 1,
                Date = new DateTime(2024, 1, 15),
                TimeArrivedAt = new DateTimeOffset(2024, 1, 15, 10, 0, 0, TimeSpan.Zero),
                TimeDepartedAt = new DateTimeOffset(2024, 1, 15, 18, 0, 0, TimeSpan.Zero)
            };

            var updatedClock = new ClocksResponse
            {
                Id = 1,
                UserId = updateRequest.UserId,
                Date = updateRequest.Date,
                TimeArrivedAt = updateRequest.TimeArrivedAt,
                TimeDepartedAt = updateRequest.TimeDepartedAt
            };

            var clocksService = new FakeClocksService(updatedClocks: updatedClock);

            var result = await ClockEndpoints.HandleUpdateClocks(1, updateRequest, clocksService);

            result.Should().BeOfType<Ok<ClocksResponse>>();
            var okResult = result as Ok<ClocksResponse>;
            okResult!.Value.Should().BeEquivalentTo(updatedClock);
        }

        #endregion

        #region DELETE /clocks/{id} Tests

        [Fact]
        public async Task HandleDeleteClocks_Returns_NoContent()
        {
            var clocksService = new FakeClocksService();

            var result = await ClockEndpoints.HandleDeleteClocks(1, clocksService);

            result.Should().BeOfType<NoContent>();
        }

        #endregion
    }
}