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
    public class PlanningEndpointsTests
    {
        private sealed class FakePlanningService : PlanningService
        {
            private readonly long _createPlanningId;
            private readonly List<PlanningResponse> _plannings;
            private readonly PlanningResponse? _planning;
            private readonly PlanningResponse? _updatedPlanning;

            public FakePlanningService(
                long createPlanningId = 0,
                List<PlanningResponse>? plannings = null,
                PlanningResponse? planning = null,
                PlanningResponse? updatedPlanning = null) : base(null!)
            {
                _createPlanningId = createPlanningId;
                _plannings = plannings ?? new List<PlanningResponse>();
                _planning = planning;
                _updatedPlanning = updatedPlanning;
            }

            public override async Task<long> CreatePlanningAsync(CreatePlanningRequest request)
            {
                return await Task.FromResult(_createPlanningId);
            }

            public override async Task<List<PlanningResponse>> GetAllPlanningsAsync()
            {
                return await Task.FromResult(_plannings);
            }

            public override async Task<PlanningResponse?> GetPlanningByIdAsync(long id)
            {
                return await Task.FromResult(_planning);
            }

            public override async Task<List<PlanningResponse>> GetPlanningsByUserAsync(long userId)
            {
                return await Task.FromResult(_plannings);
            }

            public override async Task<PlanningResponse?> UpdatePlanningAsync(long id, UpdatePlanningRequest request)
            {
                return await Task.FromResult(_updatedPlanning);
            }

            public override async Task DeletePlanningAsync(long id)
            {
                await Task.CompletedTask;
            }
        }

        #region POST /plannings Tests

        [Fact]
        public async Task HandleCreatePlanning_Returns_Ok_With_Id_On_Success()
        {
            // Arrange
            var request = new CreatePlanningRequest
            {
                UserId = 1,
                Date = new DateTime(2024, 6, 15),
                Period = "AM",
                Statut = "pending",
                TypeDemandeId = 1
            };
            var service = new FakePlanningService(createPlanningId: 123);

            // Act
            var result = await PlanningEndpoints.HandleCreatePlanning(request, service);

            // Assert
            result.Should().BeOfType<Ok<long>>();
            var okResult = result as Ok<long>;
            okResult!.Value.Should().Be(123);
        }

        [Fact]
        public async Task HandleCreatePlanning_Returns_BadRequest_On_Failure()
        {
            // Arrange
            var request = new CreatePlanningRequest
            {
                UserId = 1,
                Date = new DateTime(2024, 6, 15),
                Period = "PM",
                Statut = "approved",
                TypeDemandeId = 2
            };
            var service = new FakePlanningService(createPlanningId: 0);

            // Act
            var result = await PlanningEndpoints.HandleCreatePlanning(request, service);

            // Assert
            result.Should().BeOfType<BadRequest<string>>();
            var badRequestResult = result as BadRequest<string>;
            badRequestResult!.Value.Should().Be("Failed to create a new planning.");
        }

        [Fact]
        public async Task HandleCreatePlanning_Creates_Planning_With_Full_Day_Period()
        {
            // Arrange
            var request = new CreatePlanningRequest
            {
                UserId = 5,
                Date = new DateTime(2024, 7, 20),
                Period = "full",
                Statut = "pending",
                TypeDemandeId = 3
            };
            var service = new FakePlanningService(createPlanningId: 456);

            // Act
            var result = await PlanningEndpoints.HandleCreatePlanning(request, service);

            // Assert
            result.Should().BeOfType<Ok<long>>();
            var okResult = result as Ok<long>;
            okResult!.Value.Should().Be(456);
        }

        #endregion

        #region GET /plannings Tests

        [Fact]
        public async Task HandleGetAllPlannings_Returns_Ok_With_Plannings_When_Found()
        {
            // Arrange
            var plannings = new List<PlanningResponse>
            {
                new PlanningResponse
                {
                    Id = 1,
                    UserId = 1,
                    Date = new DateTime(2024, 6, 1),
                    Period = "AM",
                    Statut = "approved",
                    CreatedAt = DateTime.UtcNow,
                    DemandTypeId = 1
                },
                new PlanningResponse
                {
                    Id = 2,
                    UserId = 2,
                    Date = new DateTime(2024, 6, 2),
                    Period = "PM",
                    Statut = "pending",
                    CreatedAt = DateTime.UtcNow,
                    DemandTypeId = 2
                },
                new PlanningResponse
                {
                    Id = 3,
                    UserId = 1,
                    Date = new DateTime(2024, 6, 3),
                    Period = "full",
                    Statut = "rejected",
                    CreatedAt = DateTime.UtcNow,
                    DemandTypeId = 1
                }
            };
            var service = new FakePlanningService(plannings: plannings);

            // Act
            var result = await PlanningEndpoints.HandleGetAllPlannings(service);

            // Assert
            result.Should().BeOfType<Ok<List<PlanningResponse>>>();
            var okResult = result as Ok<List<PlanningResponse>>;
            okResult!.Value.Should().HaveCount(3);
            okResult.Value.Should().BeEquivalentTo(plannings);
        }

        [Fact]
        public async Task HandleGetAllPlannings_Returns_NotFound_When_No_Plannings_Exist()
        {
            // Arrange
            var service = new FakePlanningService(plannings: new List<PlanningResponse>());

            // Act
            var result = await PlanningEndpoints.HandleGetAllPlannings(service);

            // Assert
            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("No plannings found.");
        }

        [Fact]
        public async Task HandleGetAllPlannings_Returns_Plannings_With_Different_Statuses()
        {
            // Arrange
            var plannings = new List<PlanningResponse>
            {
                new PlanningResponse
                {
                    Id = 1,
                    UserId = 1,
                    Date = new DateTime(2024, 6, 1),
                    Period = "AM",
                    Statut = "pending",
                    CreatedAt = DateTime.UtcNow,
                    DemandTypeId = 1
                },
                new PlanningResponse
                {
                    Id = 2,
                    UserId = 1,
                    Date = new DateTime(2024, 6, 2),
                    Period = "PM",
                    Statut = "approved",
                    CreatedAt = DateTime.UtcNow,
                    DemandTypeId = 1
                }
            };
            var service = new FakePlanningService(plannings: plannings);

            // Act
            var result = await PlanningEndpoints.HandleGetAllPlannings(service);

            // Assert
            result.Should().BeOfType<Ok<List<PlanningResponse>>>();
            var okResult = result as Ok<List<PlanningResponse>>;
            okResult!.Value![0].Statut.Should().Be("pending");
            okResult.Value[1].Statut.Should().Be("approved");
        }

        #endregion

        #region GET /plannings/{id} Tests

        [Fact]
        public async Task HandleGetPlanningById_Returns_Ok_With_Planning_When_Found()
        {
            // Arrange
            var planning = new PlanningResponse
            {
                Id = 1,
                UserId = 10,
                Date = new DateTime(2024, 8, 15),
                Period = "full",
                Statut = "approved",
                CreatedAt = DateTime.UtcNow,
                DemandTypeId = 5
            };
            var service = new FakePlanningService(planning: planning);

            // Act
            var result = await PlanningEndpoints.HandleGetPlanningById(1, service);

            // Assert
            result.Should().BeOfType<Ok<PlanningResponse>>();
            var okResult = result as Ok<PlanningResponse>;
            okResult!.Value.Should().BeEquivalentTo(planning);
        }

        [Fact]
        public async Task HandleGetPlanningById_Returns_NotFound_When_Planning_Does_Not_Exist()
        {
            // Arrange
            var service = new FakePlanningService(planning: null);

            // Act
            var result = await PlanningEndpoints.HandleGetPlanningById(999, service);

            // Assert
            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("Planning not found.");
        }

        [Fact]
        public async Task HandleGetPlanningById_Returns_Planning_With_Morning_Period()
        {
            // Arrange
            var planning = new PlanningResponse
            {
                Id = 42,
                UserId = 7,
                Date = new DateTime(2024, 9, 10),
                Period = "AM",
                Statut = "pending",
                CreatedAt = DateTime.UtcNow,
                DemandTypeId = 3
            };
            var service = new FakePlanningService(planning: planning);

            // Act
            var result = await PlanningEndpoints.HandleGetPlanningById(42, service);

            // Assert
            result.Should().BeOfType<Ok<PlanningResponse>>();
            var okResult = result as Ok<PlanningResponse>;
            okResult!.Value!.Period.Should().Be("AM");
        }

        #endregion

        #region GET /plannings/by-user/{userId} Tests

        [Fact]
        public async Task HandleGetPlanningsByUser_Returns_Ok_With_Plannings_When_Found()
        {
            // Arrange
            var plannings = new List<PlanningResponse>
            {
                new PlanningResponse
                {
                    Id = 1,
                    UserId = 5,
                    Date = new DateTime(2024, 6, 1),
                    Period = "AM",
                    Statut = "approved",
                    CreatedAt = DateTime.UtcNow,
                    DemandTypeId = 1
                },
                new PlanningResponse
                {
                    Id = 2,
                    UserId = 5,
                    Date = new DateTime(2024, 6, 5),
                    Period = "PM",
                    Statut = "pending",
                    CreatedAt = DateTime.UtcNow,
                    DemandTypeId = 2
                }
            };
            var service = new FakePlanningService(plannings: plannings);

            // Act
            var result = await PlanningEndpoints.HandleGetPlanningsByUser(5, service);

            // Assert
            result.Should().BeOfType<Ok<List<PlanningResponse>>>();
            var okResult = result as Ok<List<PlanningResponse>>;
            okResult!.Value.Should().HaveCount(2);
            okResult.Value.Should().BeEquivalentTo(plannings);
        }

        [Fact]
        public async Task HandleGetPlanningsByUser_Returns_NotFound_When_No_Plannings_For_User()
        {
            // Arrange
            var service = new FakePlanningService(plannings: new List<PlanningResponse>());

            // Act
            var result = await PlanningEndpoints.HandleGetPlanningsByUser(999, service);

            // Assert
            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("No plannings for this user.");
        }

        [Fact]
        public async Task HandleGetPlanningsByUser_Returns_Multiple_Plannings_For_Same_User()
        {
            // Arrange
            var plannings = new List<PlanningResponse>
            {
                new PlanningResponse
                {
                    Id = 1,
                    UserId = 10,
                    Date = new DateTime(2024, 6, 1),
                    Period = "AM",
                    Statut = "approved",
                    CreatedAt = DateTime.UtcNow,
                    DemandTypeId = 1
                },
                new PlanningResponse
                {
                    Id = 2,
                    UserId = 10,
                    Date = new DateTime(2024, 6, 8),
                    Period = "full",
                    Statut = "approved",
                    CreatedAt = DateTime.UtcNow,
                    DemandTypeId = 1
                },
                new PlanningResponse
                {
                    Id = 3,
                    UserId = 10,
                    Date = new DateTime(2024, 6, 15),
                    Period = "PM",
                    Statut = "pending",
                    CreatedAt = DateTime.UtcNow,
                    DemandTypeId = 2
                }
            };
            var service = new FakePlanningService(plannings: plannings);

            // Act
            var result = await PlanningEndpoints.HandleGetPlanningsByUser(10, service);

            // Assert
            result.Should().BeOfType<Ok<List<PlanningResponse>>>();
            var okResult = result as Ok<List<PlanningResponse>>;
            okResult!.Value.Should().HaveCount(3);
            okResult.Value!.All(p => p.UserId == 10).Should().BeTrue();
        }

        #endregion

        #region PUT /plannings/{id} Tests

        [Fact]
        public async Task HandleUpdatePlanning_Returns_Ok_With_Updated_Planning_On_Success()
        {
            // Arrange
            var updateRequest = new UpdatePlanningRequest
            {
                Date = new DateTime(2024, 7, 20),
                Period = "full",
                Statut = "approved",
                TypeDemandeId = 3
            };
            var updatedPlanning = new PlanningResponse
            {
                Id = 1,
                UserId = 5,
                Date = updateRequest.Date,
                Period = updateRequest.Period,
                Statut = updateRequest.Statut,
                CreatedAt = DateTime.UtcNow,
                DemandTypeId = updateRequest.TypeDemandeId
            };
            var service = new FakePlanningService(updatedPlanning: updatedPlanning);

            // Act
            var result = await PlanningEndpoints.HandleUpdatePlanning(1, updateRequest, service);

            // Assert
            result.Should().BeOfType<Ok<PlanningResponse>>();
            var okResult = result as Ok<PlanningResponse>;
            okResult!.Value.Should().BeEquivalentTo(updatedPlanning);
        }

        [Fact]
        public async Task HandleUpdatePlanning_Returns_NotFound_When_Planning_Does_Not_Exist()
        {
            // Arrange
            var updateRequest = new UpdatePlanningRequest
            {
                Date = new DateTime(2024, 7, 20),
                Period = "AM",
                Statut = "pending",
                TypeDemandeId = 1
            };
            var service = new FakePlanningService(updatedPlanning: null);

            // Act
            var result = await PlanningEndpoints.HandleUpdatePlanning(999, updateRequest, service);

            // Assert
            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("Planning not found.");
        }

        [Fact]
        public async Task HandleUpdatePlanning_Updates_Status_From_Pending_To_Approved()
        {
            // Arrange
            var updateRequest = new UpdatePlanningRequest
            {
                Date = new DateTime(2024, 8, 1),
                Period = "PM",
                Statut = "approved",
                TypeDemandeId = 2
            };
            var updatedPlanning = new PlanningResponse
            {
                Id = 5,
                UserId = 3,
                Date = updateRequest.Date,
                Period = updateRequest.Period,
                Statut = "approved",
                CreatedAt = DateTime.UtcNow,
                DemandTypeId = updateRequest.TypeDemandeId
            };
            var service = new FakePlanningService(updatedPlanning: updatedPlanning);

            // Act
            var result = await PlanningEndpoints.HandleUpdatePlanning(5, updateRequest, service);

            // Assert
            result.Should().BeOfType<Ok<PlanningResponse>>();
            var okResult = result as Ok<PlanningResponse>;
            okResult!.Value!.Statut.Should().Be("approved");
        }

        [Fact]
        public async Task HandleUpdatePlanning_Updates_Period_Correctly()
        {
            // Arrange
            var updateRequest = new UpdatePlanningRequest
            {
                Date = new DateTime(2024, 9, 15),
                Period = "full",
                Statut = "pending",
                TypeDemandeId = 1
            };
            var updatedPlanning = new PlanningResponse
            {
                Id = 7,
                UserId = 8,
                Date = updateRequest.Date,
                Period = "full",
                Statut = updateRequest.Statut,
                CreatedAt = DateTime.UtcNow,
                DemandTypeId = updateRequest.TypeDemandeId
            };
            var service = new FakePlanningService(updatedPlanning: updatedPlanning);

            // Act
            var result = await PlanningEndpoints.HandleUpdatePlanning(7, updateRequest, service);

            // Assert
            result.Should().BeOfType<Ok<PlanningResponse>>();
            var okResult = result as Ok<PlanningResponse>;
            okResult!.Value!.Period.Should().Be("full");
        }

        #endregion

        #region DELETE /plannings/{id} Tests

        [Fact]
        public async Task HandleDeletePlanning_Returns_NoContent()
        {
            // Arrange
            var service = new FakePlanningService();

            // Act
            var result = await PlanningEndpoints.HandleDeletePlanning(1, service);

            // Assert
            result.Should().BeOfType<NoContent>();
        }

        [Fact]
        public async Task HandleDeletePlanning_Returns_NoContent_For_Any_Id()
        {
            // Arrange
            var service = new FakePlanningService();

            // Act
            var result = await PlanningEndpoints.HandleDeletePlanning(999, service);

            // Assert
            result.Should().BeOfType<NoContent>();
        }

        #endregion
    }
}