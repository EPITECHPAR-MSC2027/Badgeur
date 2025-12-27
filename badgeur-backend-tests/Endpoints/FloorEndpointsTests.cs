using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Endpoints;
using badgeur_backend.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace badgeur_backend_tests.Endpoints
{
    public class FloorEndpointsTests
    {
        private sealed class FakeFloorService : FloorService
        {
            private readonly long _createFloorId;
            private readonly List<FloorResponse> _floors;
            private readonly FloorResponse? _floor;
            private readonly FloorResponse? _updatedFloor;

            public FakeFloorService(
                long createFloorId = 0,
                List<FloorResponse>? floors = null,
                FloorResponse? floor = null,
                FloorResponse? updatedFloor = null) : base(null!)
            {
                _createFloorId = createFloorId;
                _floors = floors ?? new List<FloorResponse>();
                _floor = floor;
                _updatedFloor = updatedFloor;
            }

            public override async Task<long> CreateFloorAsync(CreateFloorRequest request)
            {
                return await Task.FromResult(_createFloorId);
            }

            public override async Task<List<FloorResponse>> GetAllFloorsAsync()
            {
                return await Task.FromResult(_floors);
            }

            public override async Task<FloorResponse?> GetFloorByIdAsync(long id)
            {
                return await Task.FromResult(_floor);
            }

            public override async Task<FloorResponse?> UpdateFloorAsync(long id, UpdateFloorRequest updateFloorRequest)
            {
                return await Task.FromResult(_updatedFloor);
            }

            public override async Task DeleteFloorAsync(long id)
            {
                await Task.CompletedTask;
            }
        }

        #region POST /floors Tests

        [Fact]
        public async Task HandleCreateFloor_Returns_Ok_With_Id_On_Success()
        {
            // Arrange
            var request = new CreateFloorRequest
            {
                FloorNumber = 1
            };
            var service = new FakeFloorService(createFloorId: 100);

            // Act
            var result = await FloorEndpoints.HandleCreateFloor(request, service);

            // Assert
            result.Should().BeOfType<Ok<long>>();
            var okResult = result as Ok<long>;
            okResult!.Value.Should().Be(100);
        }

        [Fact]
        public async Task HandleCreateFloor_Returns_BadRequest_On_Failure()
        {
            // Arrange
            var request = new CreateFloorRequest
            {
                FloorNumber = 2
            };
            var service = new FakeFloorService(createFloorId: 0);

            // Act
            var result = await FloorEndpoints.HandleCreateFloor(request, service);

            // Assert
            result.Should().BeOfType<BadRequest<string>>();
            var badRequestResult = result as BadRequest<string>;
            badRequestResult!.Value.Should().Be("Failed to create a new floor.");
        }

        [Fact]
        public async Task HandleCreateFloor_Creates_Floor_With_Ground_Floor_Number()
        {
            // Arrange
            var request = new CreateFloorRequest
            {
                FloorNumber = 0
            };
            var service = new FakeFloorService(createFloorId: 50);

            // Act
            var result = await FloorEndpoints.HandleCreateFloor(request, service);

            // Assert
            result.Should().BeOfType<Ok<long>>();
            var okResult = result as Ok<long>;
            okResult!.Value.Should().Be(50);
        }

        [Fact]
        public async Task HandleCreateFloor_Creates_Floor_With_Negative_Floor_Number()
        {
            // Arrange (for basement levels)
            var request = new CreateFloorRequest
            {
                FloorNumber = -1
            };
            var service = new FakeFloorService(createFloorId: 25);

            // Act
            var result = await FloorEndpoints.HandleCreateFloor(request, service);

            // Assert
            result.Should().BeOfType<Ok<long>>();
            var okResult = result as Ok<long>;
            okResult!.Value.Should().Be(25);
        }

        #endregion

        #region GET /floors Tests

        [Fact]
        public async Task HandleGetAllFloors_Returns_Ok_With_Floors_When_Found()
        {
            // Arrange
            var floors = new List<FloorResponse>
            {
                new FloorResponse { Id = 1, FloorNumber = 0 },
                new FloorResponse { Id = 2, FloorNumber = 1 },
                new FloorResponse { Id = 3, FloorNumber = 2 },
                new FloorResponse { Id = 4, FloorNumber = 3 }
            };
            var service = new FakeFloorService(floors: floors);

            // Act
            var result = await FloorEndpoints.HandleGetAllFloors(service);

            // Assert
            result.Should().BeOfType<Ok<List<FloorResponse>>>();
            var okResult = result as Ok<List<FloorResponse>>;
            okResult!.Value.Should().HaveCount(4);
            okResult.Value.Should().BeEquivalentTo(floors);
        }

        [Fact]
        public async Task HandleGetAllFloors_Returns_NotFound_When_No_Floors_Exist()
        {
            // Arrange
            var service = new FakeFloorService(floors: new List<FloorResponse>());

            // Act
            var result = await FloorEndpoints.HandleGetAllFloors(service);

            // Assert
            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("No floors found.");
        }

        [Fact]
        public async Task HandleGetAllFloors_Returns_Floors_In_Order()
        {
            // Arrange
            var floors = new List<FloorResponse>
            {
                new FloorResponse { Id = 1, FloorNumber = -2 },
                new FloorResponse { Id = 2, FloorNumber = -1 },
                new FloorResponse { Id = 3, FloorNumber = 0 },
                new FloorResponse { Id = 4, FloorNumber = 1 }
            };
            var service = new FakeFloorService(floors: floors);

            // Act
            var result = await FloorEndpoints.HandleGetAllFloors(service);

            // Assert
            result.Should().BeOfType<Ok<List<FloorResponse>>>();
            var okResult = result as Ok<List<FloorResponse>>;
            okResult!.Value.Should().HaveCount(4);
            okResult.Value![0].FloorNumber.Should().Be(-2);
            okResult.Value[3].FloorNumber.Should().Be(1);
        }

        #endregion

        #region GET /floors/{id} Tests

        [Fact]
        public async Task HandleGetFloorById_Returns_Ok_With_Floor_When_Found()
        {
            // Arrange
            var floor = new FloorResponse
            {
                Id = 1,
                FloorNumber = 5
            };
            var service = new FakeFloorService(floor: floor);

            // Act
            var result = await FloorEndpoints.HandleGetFloorById(1, service);

            // Assert
            result.Should().BeOfType<Ok<FloorResponse>>();
            var okResult = result as Ok<FloorResponse>;
            okResult!.Value.Should().BeEquivalentTo(floor);
        }

        [Fact]
        public async Task HandleGetFloorById_Returns_NotFound_When_Floor_Does_Not_Exist()
        {
            // Arrange
            var service = new FakeFloorService(floor: null);

            // Act
            var result = await FloorEndpoints.HandleGetFloorById(999, service);

            // Assert
            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("Floor was not found.");
        }

        [Fact]
        public async Task HandleGetFloorById_Returns_Ground_Floor()
        {
            // Arrange
            var floor = new FloorResponse
            {
                Id = 10,
                FloorNumber = 0
            };
            var service = new FakeFloorService(floor: floor);

            // Act
            var result = await FloorEndpoints.HandleGetFloorById(10, service);

            // Assert
            result.Should().BeOfType<Ok<FloorResponse>>();
            var okResult = result as Ok<FloorResponse>;
            okResult!.Value!.FloorNumber.Should().Be(0);
        }

        [Fact]
        public async Task HandleGetFloorById_Returns_Basement_Floor()
        {
            // Arrange
            var floor = new FloorResponse
            {
                Id = 15,
                FloorNumber = -1
            };
            var service = new FakeFloorService(floor: floor);

            // Act
            var result = await FloorEndpoints.HandleGetFloorById(15, service);

            // Assert
            result.Should().BeOfType<Ok<FloorResponse>>();
            var okResult = result as Ok<FloorResponse>;
            okResult!.Value!.FloorNumber.Should().Be(-1);
        }

        #endregion

        #region PUT /floors/{id} Tests

        [Fact]
        public async Task HandleUpdateFloor_Returns_Ok_With_Updated_Floor_On_Success()
        {
            // Arrange
            var updateRequest = new UpdateFloorRequest
            {
                FloorNumber = 10
            };
            var updatedFloor = new FloorResponse
            {
                Id = 1,
                FloorNumber = updateRequest.FloorNumber
            };
            var service = new FakeFloorService(updatedFloor: updatedFloor);

            // Act
            var result = await FloorEndpoints.HandleUpdateFloor(1, updateRequest, service);

            // Assert
            result.Should().BeOfType<Ok<FloorResponse>>();
            var okResult = result as Ok<FloorResponse>;
            okResult!.Value.Should().BeEquivalentTo(updatedFloor);
        }

        [Fact]
        public async Task HandleUpdateFloor_Returns_NotFound_When_Floor_Does_Not_Exist()
        {
            // Arrange
            var updateRequest = new UpdateFloorRequest
            {
                FloorNumber = 3
            };
            var service = new FakeFloorService(updatedFloor: null);

            // Act
            var result = await FloorEndpoints.HandleUpdateFloor(999, updateRequest, service);

            // Assert
            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("Floor not found.");
        }

        [Fact]
        public async Task HandleUpdateFloor_Updates_FloorNumber_Correctly()
        {
            // Arrange
            var updateRequest = new UpdateFloorRequest
            {
                FloorNumber = 7
            };
            var updatedFloor = new FloorResponse
            {
                Id = 5,
                FloorNumber = 7
            };
            var service = new FakeFloorService(updatedFloor: updatedFloor);

            // Act
            var result = await FloorEndpoints.HandleUpdateFloor(5, updateRequest, service);

            // Assert
            result.Should().BeOfType<Ok<FloorResponse>>();
            var okResult = result as Ok<FloorResponse>;
            okResult!.Value!.FloorNumber.Should().Be(7);
        }

        [Fact]
        public async Task HandleUpdateFloor_Can_Update_To_Ground_Floor()
        {
            // Arrange
            var updateRequest = new UpdateFloorRequest
            {
                FloorNumber = 0
            };
            var updatedFloor = new FloorResponse
            {
                Id = 3,
                FloorNumber = 0
            };
            var service = new FakeFloorService(updatedFloor: updatedFloor);

            // Act
            var result = await FloorEndpoints.HandleUpdateFloor(3, updateRequest, service);

            // Assert
            result.Should().BeOfType<Ok<FloorResponse>>();
            var okResult = result as Ok<FloorResponse>;
            okResult!.Value!.FloorNumber.Should().Be(0);
        }

        [Fact]
        public async Task HandleUpdateFloor_Can_Update_To_Basement()
        {
            // Arrange
            var updateRequest = new UpdateFloorRequest
            {
                FloorNumber = -2
            };
            var updatedFloor = new FloorResponse
            {
                Id = 8,
                FloorNumber = -2
            };
            var service = new FakeFloorService(updatedFloor: updatedFloor);

            // Act
            var result = await FloorEndpoints.HandleUpdateFloor(8, updateRequest, service);

            // Assert
            result.Should().BeOfType<Ok<FloorResponse>>();
            var okResult = result as Ok<FloorResponse>;
            okResult!.Value!.FloorNumber.Should().Be(-2);
        }

        #endregion

        #region DELETE /floors/{id} Tests

        [Fact]
        public async Task HandleDeleteFloor_Returns_NoContent()
        {
            // Arrange
            var service = new FakeFloorService();

            // Act
            var result = await FloorEndpoints.HandleDeleteFloor(1, service);

            // Assert
            result.Should().BeOfType<NoContent>();
        }

        [Fact]
        public async Task HandleDeleteFloor_Returns_NoContent_For_Any_Id()
        {
            // Arrange
            var service = new FakeFloorService();

            // Act
            var result = await FloorEndpoints.HandleDeleteFloor(999, service);

            // Assert
            result.Should().BeOfType<NoContent>();
        }

        #endregion
    }
}