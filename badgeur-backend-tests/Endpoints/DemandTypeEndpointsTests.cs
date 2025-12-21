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
    public class DemandTypeEndpointsTests
    {
        private sealed class FakeDemandTypeService : DemandTypeService
        {
            private readonly long _createDemandTypeId;
            private readonly List<DemandTypeResponse> _demandTypes;
            private readonly DemandTypeResponse? _demandType;
            private readonly DemandTypeResponse? _updatedDemandType;

            public FakeDemandTypeService(
                long createDemandTypeId = 0,
                List<DemandTypeResponse>? demandTypes = null,
                DemandTypeResponse? demandType = null,
                DemandTypeResponse? updatedDemandType = null) : base(null!)
            {
                _createDemandTypeId = createDemandTypeId;
                _demandTypes = demandTypes ?? new List<DemandTypeResponse>();
                _demandType = demandType;
                _updatedDemandType = updatedDemandType;
            }

            public override async Task<long> CreateDemandTypeAsync(CreateDemandTypeRequest request)
            {
                return await Task.FromResult(_createDemandTypeId);
            }

            public override async Task<List<DemandTypeResponse>> GetAllDemandTypesAsync()
            {
                return await Task.FromResult(_demandTypes);
            }

            public override async Task<DemandTypeResponse?> GetDemandTypeByIdAsync(long id)
            {
                return await Task.FromResult(_demandType);
            }

            public override async Task<DemandTypeResponse?> UpdateDemandTypeAsync(long id, UpdateDemandTypeRequest request)
            {
                return await Task.FromResult(_updatedDemandType);
            }

            public override async Task DeleteDemandTypeAsync(long id)
            {
                await Task.CompletedTask;
            }
        }

        #region POST /type-demandes Tests

        [Fact]
        public async Task HandleCreateDemandType_Returns_Ok_With_Id_On_Success()
        {
            // Arrange
            var request = new CreateDemandTypeRequest
            {
                Nom = "Congé payé"
            };
            var service = new FakeDemandTypeService(createDemandTypeId: 123);

            // Act
            var result = await DemandTypeEndpoints.HandleCreateDemandType(request, service);

            // Assert
            result.Should().BeOfType<Ok<long>>();
            var okResult = result as Ok<long>;
            okResult!.Value.Should().Be(123);
        }

        [Fact]
        public async Task HandleCreateDemandType_Returns_BadRequest_On_Failure()
        {
            // Arrange
            var request = new CreateDemandTypeRequest
            {
                Nom = "Congé maladie"
            };
            var service = new FakeDemandTypeService(createDemandTypeId: 0);

            // Act
            var result = await DemandTypeEndpoints.HandleCreateDemandType(request, service);

            // Assert
            result.Should().BeOfType<BadRequest<string>>();
            var badRequestResult = result as BadRequest<string>;
            badRequestResult!.Value.Should().Be("Failed to create a new demand type.");
        }

        [Fact]
        public async Task HandleCreateDemandType_Creates_DemandType_With_Valid_Name()
        {
            // Arrange
            var request = new CreateDemandTypeRequest
            {
                Nom = "Formation"
            };
            var service = new FakeDemandTypeService(createDemandTypeId: 456);

            // Act
            var result = await DemandTypeEndpoints.HandleCreateDemandType(request, service);

            // Assert
            result.Should().BeOfType<Ok<long>>();
            var okResult = result as Ok<long>;
            okResult!.Value.Should().Be(456);
        }

        #endregion

        #region GET /type-demandes Tests

        [Fact]
        public async Task HandleGetAllDemandTypes_Returns_Ok_With_DemandTypes_When_Found()
        {
            // Arrange
            var demandTypes = new List<DemandTypeResponse>
            {
                new DemandTypeResponse { Id = 1, Nom = "Congé payé" },
                new DemandTypeResponse { Id = 2, Nom = "Congé maladie" },
                new DemandTypeResponse { Id = 3, Nom = "Formation" }
            };
            var service = new FakeDemandTypeService(demandTypes: demandTypes);

            // Act
            var result = await DemandTypeEndpoints.HandleGetAllDemandTypes(service);

            // Assert
            result.Should().BeOfType<Ok<List<DemandTypeResponse>>>();
            var okResult = result as Ok<List<DemandTypeResponse>>;
            okResult!.Value.Should().HaveCount(3);
            okResult.Value.Should().BeEquivalentTo(demandTypes);
        }

        [Fact]
        public async Task HandleGetAllDemandTypes_Returns_NotFound_When_No_DemandTypes_Exist()
        {
            // Arrange
            var service = new FakeDemandTypeService(demandTypes: new List<DemandTypeResponse>());

            // Act
            var result = await DemandTypeEndpoints.HandleGetAllDemandTypes(service);

            // Assert
            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("No type_demandes found.");
        }

        [Fact]
        public async Task HandleGetAllDemandTypes_Returns_Single_DemandType_When_Only_One_Exists()
        {
            // Arrange
            var demandTypes = new List<DemandTypeResponse>
            {
                new DemandTypeResponse { Id = 10, Nom = "Télétravail" }
            };
            var service = new FakeDemandTypeService(demandTypes: demandTypes);

            // Act
            var result = await DemandTypeEndpoints.HandleGetAllDemandTypes(service);

            // Assert
            result.Should().BeOfType<Ok<List<DemandTypeResponse>>>();
            var okResult = result as Ok<List<DemandTypeResponse>>;
            okResult!.Value.Should().HaveCount(1);
            okResult.Value![0].Nom.Should().Be("Télétravail");
        }

        #endregion

        #region GET /type-demandes/{id} Tests

        [Fact]
        public async Task HandleGetDemandTypeById_Returns_Ok_With_DemandType_When_Found()
        {
            // Arrange
            var demandType = new DemandTypeResponse
            {
                Id = 1,
                Nom = "Congé sans solde"
            };
            var service = new FakeDemandTypeService(demandType: demandType);

            // Act
            var result = await DemandTypeEndpoints.HandleGetDemandTypeById(1, service);

            // Assert
            result.Should().BeOfType<Ok<DemandTypeResponse>>();
            var okResult = result as Ok<DemandTypeResponse>;
            okResult!.Value.Should().BeEquivalentTo(demandType);
        }

        [Fact]
        public async Task HandleGetDemandTypeById_Returns_NotFound_When_DemandType_Does_Not_Exist()
        {
            // Arrange
            var service = new FakeDemandTypeService(demandType: null);

            // Act
            var result = await DemandTypeEndpoints.HandleGetDemandTypeById(999, service);

            // Assert
            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("DemandType not found.");
        }

        [Fact]
        public async Task HandleGetDemandTypeById_Returns_Correct_DemandType_For_Given_Id()
        {
            // Arrange
            var demandType = new DemandTypeResponse
            {
                Id = 42,
                Nom = "Congé parental"
            };
            var service = new FakeDemandTypeService(demandType: demandType);

            // Act
            var result = await DemandTypeEndpoints.HandleGetDemandTypeById(42, service);

            // Assert
            result.Should().BeOfType<Ok<DemandTypeResponse>>();
            var okResult = result as Ok<DemandTypeResponse>;
            okResult!.Value!.Id.Should().Be(42);
            okResult.Value.Nom.Should().Be("Congé parental");
        }

        #endregion

        #region PUT /type-demandes/{id} Tests

        [Fact]
        public async Task HandleUpdateDemandType_Returns_Ok_With_Updated_DemandType_On_Success()
        {
            // Arrange
            var updateRequest = new UpdateDemandTypeRequest
            {
                Nom = "Congé sabbatique"
            };
            var updatedDemandType = new DemandTypeResponse
            {
                Id = 1,
                Nom = updateRequest.Nom
            };
            var service = new FakeDemandTypeService(updatedDemandType: updatedDemandType);

            // Act
            var result = await DemandTypeEndpoints.HandleUpdateDemandType(1, updateRequest, service);

            // Assert
            result.Should().BeOfType<Ok<DemandTypeResponse>>();
            var okResult = result as Ok<DemandTypeResponse>;
            okResult!.Value.Should().BeEquivalentTo(updatedDemandType);
        }

        [Fact]
        public async Task HandleUpdateDemandType_Returns_NotFound_When_DemandType_Does_Not_Exist()
        {
            // Arrange
            var updateRequest = new UpdateDemandTypeRequest
            {
                Nom = "RTT"
            };
            var service = new FakeDemandTypeService(updatedDemandType: null);

            // Act
            var result = await DemandTypeEndpoints.HandleUpdateDemandType(999, updateRequest, service);

            // Assert
            result.Should().BeOfType<NotFound<string>>();
            var notFoundResult = result as NotFound<string>;
            notFoundResult!.Value.Should().Be("DemandType not found.");
        }

        [Fact]
        public async Task HandleUpdateDemandType_Updates_Name_Correctly()
        {
            // Arrange
            var updateRequest = new UpdateDemandTypeRequest
            {
                Nom = "Congé maternité"
            };
            var updatedDemandType = new DemandTypeResponse
            {
                Id = 5,
                Nom = "Congé maternité"
            };
            var service = new FakeDemandTypeService(updatedDemandType: updatedDemandType);

            // Act
            var result = await DemandTypeEndpoints.HandleUpdateDemandType(5, updateRequest, service);

            // Assert
            result.Should().BeOfType<Ok<DemandTypeResponse>>();
            var okResult = result as Ok<DemandTypeResponse>;
            okResult!.Value!.Nom.Should().Be("Congé maternité");
        }

        #endregion

        #region DELETE /type-demandes/{id} Tests

        [Fact]
        public async Task HandleDeleteDemandType_Returns_NoContent()
        {
            // Arrange
            var service = new FakeDemandTypeService();

            // Act
            var result = await DemandTypeEndpoints.HandleDeleteDemandType(1, service);

            // Assert
            result.Should().BeOfType<NoContent>();
        }

        [Fact]
        public async Task HandleDeleteDemandType_Returns_NoContent_For_Any_Id()
        {
            // Arrange
            var service = new FakeDemandTypeService();

            // Act
            var result = await DemandTypeEndpoints.HandleDeleteDemandType(999, service);

            // Assert
            result.Should().BeOfType<NoContent>();
        }

        #endregion
    }
}