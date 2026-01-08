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
    public class BadgeLogEventEndpointsTests
    {
        private sealed class FakeBadgeLogEventService : BadgeLogEventService
        {
            private readonly long _createBadgeLogEventId;
            private readonly List<BadgeLogEventResponse> _badgeLogEvents;
            private readonly BadgeLogEventResponse? _badgeLogEvent;
            private readonly BadgeLogEventResponse? _updatedBadgeLogEvent;

            public FakeBadgeLogEventService(
                long createBadgeLogEventId = 0,
                List<BadgeLogEventResponse>? badgeLogEvents = null,
                BadgeLogEventResponse? badgeLogEvent = null,
                BadgeLogEventResponse? updatedBadgeLogEvent = null) : base(null!)
            {
                _createBadgeLogEventId = createBadgeLogEventId;
                _badgeLogEvents = badgeLogEvents ?? new List<BadgeLogEventResponse>();
                _badgeLogEvent = badgeLogEvent;
                _updatedBadgeLogEvent = updatedBadgeLogEvent;
            }

            public override async Task<long> CreateBadgeLogEventAsync(CreateBadgeLogEventRequest request)
            {
                return await Task.FromResult(_createBadgeLogEventId);
            }

            public override async Task<List<BadgeLogEventResponse>> GetAllBadgeLogEventsAsync()
            {
                return await Task.FromResult(_badgeLogEvents);
            }

            public override async Task<BadgeLogEventResponse?> GetBadgeLogEventByIdAsync(long id)
            {
                return await Task.FromResult(_badgeLogEvent);
            }

            public override async Task<List<BadgeLogEventResponse>> GetBadgeLogEventsByUserIdAsync(long userId)
            {
                return await Task.FromResult(_badgeLogEvents);
            }

            public override async Task<BadgeLogEventResponse> UpdateBadgeLogEventAsync(long id, UpdateBadgeLogEventRequest updateBadgeLogEventRequest)
            {
                return await Task.FromResult(_updatedBadgeLogEvent!);
            }

            public override async Task DeleteBadgeLogEventAsync(long id)
            {
                await Task.CompletedTask;
            }
        }

        #region CreateBadgeLogEvent Tests

        [Fact]
        public async Task CreateBadgeLogEvent_Returns_Ok_With_Id_On_Success()
        {
            // Arrange
            var request = new CreateBadgeLogEventRequest
            {
                BadgedAt = DateTime.UtcNow,
                UserId = 1
            };
            var service = new FakeBadgeLogEventService(createBadgeLogEventId: 123);

            // Act
            var result = await BadgeLogEventEndpoints.HandleCreateBadgeLogEvent(request, service);

            // Assert
            result.Should().BeOfType<Ok<long?>>();
            var okResult = result as Ok<long>;
            okResult!.Value.Should().Be(123);
        }

        [Fact]
        public async Task CreateBadgeLogEvent_Returns_BadRequest_On_Failure()
        {
            // Arrange
            var request = new CreateBadgeLogEventRequest
            {
                BadgedAt = DateTime.UtcNow,
                UserId = 1
            };
            var service = new FakeBadgeLogEventService(createBadgeLogEventId: 0);

            // Act
            var result = await BadgeLogEventEndpoints.HandleCreateBadgeLogEvent(request, service);

            // Assert
            result.Should().BeOfType<BadRequest<string>>();
            var badRequestResult = result as BadRequest<string>;
            badRequestResult!.Value.Should().Be("Failed to create a new badge log event.");
        }

        #endregion

        #region GetAllBadgeLogEvents Tests

        [Fact]
        public async Task GetAllBadgeLogEvents_Returns_Ok_With_BadgeLogEvents_When_Found()
        {
            // Arrange
            var badgeLogEvents = new List<BadgeLogEventResponse>
            {
                new BadgeLogEventResponse { Id = 1, BadgedAt = DateTime.UtcNow, UserId = 1 },
                new BadgeLogEventResponse { Id = 2, BadgedAt = DateTime.UtcNow.AddHours(1), UserId = 1 }
            };
            var service = new FakeBadgeLogEventService(badgeLogEvents: badgeLogEvents);

            // Act
            var result = await BadgeLogEventEndpoints.HandleGetAllBadgeLogEvents(service);

            // Assert
            result.Should().BeOfType<Ok<List<BadgeLogEventResponse>>>();
            var okResult = result as Ok<List<BadgeLogEventResponse>>;
            okResult!.Value.Should().HaveCount(2);
            okResult.Value.Should().BeEquivalentTo(badgeLogEvents);
        }

        [Fact]
        public async Task GetAllBadgeLogEvents_Returns_NotFound_When_No_BadgeLogEvents_Exist()
        {
            // Arrange
            var service = new FakeBadgeLogEventService(badgeLogEvents: new List<BadgeLogEventResponse>());

            // Act
            var result = await BadgeLogEventEndpoints.HandleGetAllBadgeLogEvents(service);

            // Assert
            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("No badge log events found.");
        }

        #endregion

        #region GetBadgeLogEventById Tests

        [Fact]
        public async Task GetBadgeLogEventById_Returns_Ok_With_BadgeLogEvent_When_Found()
        {
            // Arrange
            var badgeLogEvent = new BadgeLogEventResponse
            {
                Id = 1,
                BadgedAt = DateTime.UtcNow,
                UserId = 1
            };
            var service = new FakeBadgeLogEventService(badgeLogEvent: badgeLogEvent);

            // Act
            var result = await BadgeLogEventEndpoints.HandleGetBadgeLogEventById(1, service);

            // Assert
            result.Should().BeOfType<Ok<BadgeLogEventResponse>>();
            var okResult = result as Ok<BadgeLogEventResponse>;
            okResult!.Value.Should().BeEquivalentTo(badgeLogEvent);
        }

        [Fact]
        public async Task GetBadgeLogEventById_Returns_NotFound_When_BadgeLogEvent_Does_Not_Exist()
        {
            // Arrange
            var service = new FakeBadgeLogEventService(badgeLogEvent: null);

            // Act
            var result = await BadgeLogEventEndpoints.HandleGetBadgeLogEventById(999, service);

            // Assert
            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("Badge log event was not found.");
        }

        #endregion

        #region GetBadgeLogEventsByUserId Tests

        [Fact]
        public async Task GetBadgeLogEventsByUserId_Returns_Ok_With_BadgeLogEvents_When_Found()
        {
            // Arrange
            var badgeLogEvents = new List<BadgeLogEventResponse>
            {
                new BadgeLogEventResponse { Id = 1, BadgedAt = DateTime.UtcNow, UserId = 1 },
                new BadgeLogEventResponse { Id = 2, BadgedAt = DateTime.UtcNow.AddHours(2), UserId = 1 }
            };
            var service = new FakeBadgeLogEventService(badgeLogEvents: badgeLogEvents);

            // Act
            var result = await BadgeLogEventEndpoints.HandleGetBadgeLogEventsByUserId(1, service);

            // Assert
            result.Should().BeOfType<Ok<List<BadgeLogEventResponse>>>();
            var okResult = result as Ok<List<BadgeLogEventResponse>>;
            okResult!.Value.Should().HaveCount(2);
            okResult.Value.Should().BeEquivalentTo(badgeLogEvents);
        }

        [Fact]
        public async Task GetBadgeLogEventsByUserId_Returns_NotFound_When_No_Events_For_User()
        {
            // Arrange
            var service = new FakeBadgeLogEventService(badgeLogEvents: new List<BadgeLogEventResponse>());

            // Act
            var result = await BadgeLogEventEndpoints.HandleGetBadgeLogEventsByUserId(999, service);

            // Assert
            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("No badge log events found for this user.");
        }

        #endregion

        #region UpdateBadgeLogEvent Tests

        [Fact]
        public async Task UpdateBadgeLogEvent_Returns_Ok_With_Updated_BadgeLogEvent_On_Success()
        {
            // Arrange
            var updateRequest = new UpdateBadgeLogEventRequest
            {
                BadgedAt = DateTime.UtcNow,
                UserId = 1
            };
            var updatedBadgeLogEvent = new BadgeLogEventResponse
            {
                Id = 1,
                BadgedAt = updateRequest.BadgedAt,
                UserId = updateRequest.UserId
            };
            var service = new FakeBadgeLogEventService(updatedBadgeLogEvent: updatedBadgeLogEvent);

            // Act
            var result = await BadgeLogEventEndpoints.HandleUpdateBadgeLogEvent(1, updateRequest, service);

            // Assert
            result.Should().BeOfType<Ok<BadgeLogEventResponse>>();
            var okResult = result as Ok<BadgeLogEventResponse>;
            okResult!.Value.Should().BeEquivalentTo(updatedBadgeLogEvent);
        }

        [Fact]
        public async Task UpdateBadgeLogEvent_Returns_NotFound_When_BadgeLogEvent_Does_Not_Exist()
        {
            // Arrange
            var updateRequest = new UpdateBadgeLogEventRequest
            {
                BadgedAt = DateTime.UtcNow,
                UserId = 1
            };
            var service = new FakeBadgeLogEventService(updatedBadgeLogEvent: null);

            // Act
            var result = await BadgeLogEventEndpoints.HandleUpdateBadgeLogEvent(999, updateRequest, service);

            // Assert
            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("Badge log event not found");
        }

        #endregion

        #region DeleteBadgeLogEvent Tests

        [Fact]
        public async Task DeleteBadgeLogEvent_Returns_NoContent()
        {
            // Arrange
            var service = new FakeBadgeLogEventService();

            // Act
            var result = await BadgeLogEventEndpoints.HandleDeleteBadgeLogEvent(1, service);

            // Assert
            result.Should().BeOfType<NoContent>();
        }

        #endregion
    }
}