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
    public class WorkspaceEndpointsTests
    {
        private sealed class FakeWorkspaceService : WorkspaceService
        {
            private readonly long _createWorkspaceId;
            private readonly List<WorkspaceResponse> _workspaces;
            private readonly WorkspaceResponse? _workspace;
            private readonly WorkspaceResponse? _updatedWorkspace;

            public FakeWorkspaceService(
                long createWorkspaceId = 0,
                List<WorkspaceResponse>? workspaces = null,
                WorkspaceResponse? workspace = null,
                WorkspaceResponse? updatedWorkspace = null) : base(null!)
            {
                _createWorkspaceId = createWorkspaceId;
                _workspaces = workspaces ?? new List<WorkspaceResponse>();
                _workspace = workspace;
                _updatedWorkspace = updatedWorkspace;
            }

            public override async Task<long> CreateWorkspaceAsync(CreateWorkspaceRequest request)
            {
                return await Task.FromResult(_createWorkspaceId);
            }

            public override async Task<List<WorkspaceResponse>> GetAllWorkspacesAsync()
            {
                return await Task.FromResult(_workspaces);
            }

            public override async Task<WorkspaceResponse?> GetWorkspaceByIdAsync(long id)
            {
                return await Task.FromResult(_workspace);
            }

            public override async Task<List<WorkspaceResponse>> GetWorkspacesByFloorIdAsync(long floorId)
            {
                return await Task.FromResult(_workspaces);
            }

            public override async Task<WorkspaceResponse?> UpdateWorkspaceAsync(long id, UpdateWorkspaceRequest updateWorkspaceRequest)
            {
                return await Task.FromResult(_updatedWorkspace);
            }

            public override async Task DeleteWorkspaceAsync(long id)
            {
                await Task.CompletedTask;
            }
        }

        #region CreateWorkspace Tests

        [Fact]
        public async Task HandleCreateWorkspace_Returns_BadRequest_When_Creation_Fails()
        {
            var request = new CreateWorkspaceRequest { Number = 101, IdFloor = 1 };
            var workspaceService = new FakeWorkspaceService(createWorkspaceId: 0);

            var result = await WorkspaceEndpoints.HandleCreateWorkspace(request, workspaceService);

            result.Should().BeOfType<BadRequest<string>>();
            var badRequest = (BadRequest<string>)result;
            badRequest.Value.Should().Be("Failed to create a new workspace.");
        }

        [Fact]
        public async Task HandleCreateWorkspace_Returns_Ok_With_WorkspaceId_On_Success()
        {
            var request = new CreateWorkspaceRequest { Number = 101, IdFloor = 1 };
            var workspaceService = new FakeWorkspaceService(createWorkspaceId: 50);

            var result = await WorkspaceEndpoints.HandleCreateWorkspace(request, workspaceService);

            result.Should().BeOfType<Ok<long>>();
            var ok = (Ok<long>)result;
            ok.Value.Should().Be(50);
        }

        #endregion

        #region GetAllWorkspaces Tests

        [Fact]
        public async Task HandleGetAllWorkspaces_Returns_NotFound_When_No_Workspaces_Exist()
        {
            var workspaceService = new FakeWorkspaceService(workspaces: new List<WorkspaceResponse>());

            var result = await WorkspaceEndpoints.HandleGetAllWorkspaces(workspaceService);

            result.Should().BeOfType<NotFound<string>>();
            var notFound = (NotFound<string>)result;
            notFound.Value.Should().Be("No workspaces found.");
        }

        [Fact]
        public async Task HandleGetAllWorkspaces_Returns_Ok_With_WorkspaceList_On_Success()
        {
            var workspaces = new List<WorkspaceResponse>
            {
                new WorkspaceResponse { Id = 1, Number = 101, IdFloor = 1 },
                new WorkspaceResponse { Id = 2, Number = 102, IdFloor = 1 },
                new WorkspaceResponse { Id = 3, Number = 201, IdFloor = 2 }
            };
            var workspaceService = new FakeWorkspaceService(workspaces: workspaces);

            var result = await WorkspaceEndpoints.HandleGetAllWorkspaces(workspaceService);

            result.Should().BeOfType<Ok<List<WorkspaceResponse>>>();
            var ok = (Ok<List<WorkspaceResponse>>)result;
            ok.Value.Should().HaveCount(3);
            ok.Value![0].Number.Should().Be(101);
            ok.Value![1].IdFloor.Should().Be(1);
            ok.Value![2].Id.Should().Be(3);
        }

        #endregion

        #region GetWorkspaceById Tests

        [Fact]
        public async Task HandleGetWorkspaceById_Returns_NotFound_When_Workspace_Does_Not_Exist()
        {
            var workspaceService = new FakeWorkspaceService(workspace: null);

            var result = await WorkspaceEndpoints.HandleGetWorkspaceById(999, workspaceService);

            result.Should().BeOfType<NotFound<string>>();
            var notFound = (NotFound<string>)result;
            notFound.Value.Should().Be("Workspace was not found.");
        }

        [Fact]
        public async Task HandleGetWorkspaceById_Returns_Ok_With_Workspace_On_Success()
        {
            var workspace = new WorkspaceResponse { Id = 1, Number = 101, IdFloor = 2 };
            var workspaceService = new FakeWorkspaceService(workspace: workspace);

            var result = await WorkspaceEndpoints.HandleGetWorkspaceById(1, workspaceService);

            result.Should().BeOfType<Ok<WorkspaceResponse>>();
            var ok = (Ok<WorkspaceResponse>)result;
            ok.Value.Should().NotBeNull();
            ok.Value!.Id.Should().Be(1);
            ok.Value!.Number.Should().Be(101);
            ok.Value!.IdFloor.Should().Be(2);
        }

        #endregion

        #region GetWorkspacesByFloorId Tests

        [Fact]
        public async Task HandleGetWorkspacesByFloorId_Returns_NotFound_When_No_Workspaces_Found()
        {
            var workspaceService = new FakeWorkspaceService(workspaces: new List<WorkspaceResponse>());

            var result = await WorkspaceEndpoints.HandleGetWorkspacesByFloorId(5, workspaceService);

            result.Should().BeOfType<NotFound<string>>();
            var notFound = (NotFound<string>)result;
            notFound.Value.Should().Be("No workspaces found for this floor.");
        }

        [Fact]
        public async Task HandleGetWorkspacesByFloorId_Returns_Ok_With_WorkspaceList_On_Success()
        {
            var workspaces = new List<WorkspaceResponse>
            {
                new WorkspaceResponse { Id = 1, Number = 201, IdFloor = 2 },
                new WorkspaceResponse { Id = 2, Number = 202, IdFloor = 2 },
                new WorkspaceResponse { Id = 3, Number = 203, IdFloor = 2 }
            };
            var workspaceService = new FakeWorkspaceService(workspaces: workspaces);

            var result = await WorkspaceEndpoints.HandleGetWorkspacesByFloorId(2, workspaceService);

            result.Should().BeOfType<Ok<List<WorkspaceResponse>>>();
            var ok = (Ok<List<WorkspaceResponse>>)result;
            ok.Value.Should().HaveCount(3);
            ok.Value!.Should().AllSatisfy(w => w.IdFloor.Should().Be(2));
        }

        #endregion

        #region UpdateWorkspace Tests

        [Fact]
        public async Task HandleUpdateWorkspace_Returns_NotFound_When_Workspace_Does_Not_Exist()
        {
            var request = new UpdateWorkspaceRequest { Number = 301, IdFloor = 3 };
            var workspaceService = new FakeWorkspaceService(updatedWorkspace: null);

            var result = await WorkspaceEndpoints.HandleUpdateWorkspace(999, request, workspaceService);

            result.Should().BeOfType<NotFound<string>>();
            var notFound = (NotFound<string>)result;
            notFound.Value.Should().Be("Workspace not found");
        }

        [Fact]
        public async Task HandleUpdateWorkspace_Returns_Ok_With_UpdatedWorkspace_On_Success()
        {
            var request = new UpdateWorkspaceRequest { Number = 305, IdFloor = 5 };
            var updatedWorkspace = new WorkspaceResponse { Id = 1, Number = 305, IdFloor = 5 };
            var workspaceService = new FakeWorkspaceService(updatedWorkspace: updatedWorkspace);

            var result = await WorkspaceEndpoints.HandleUpdateWorkspace(1, request, workspaceService);

            result.Should().BeOfType<Ok<WorkspaceResponse>>();
            var ok = (Ok<WorkspaceResponse>)result;
            ok.Value.Should().NotBeNull();
            ok.Value!.Id.Should().Be(1);
            ok.Value!.Number.Should().Be(305);
            ok.Value!.IdFloor.Should().Be(5);
        }

        #endregion

        #region DeleteWorkspace Tests

        [Fact]
        public async Task HandleDeleteWorkspace_Returns_NoContent_On_Success()
        {
            var workspaceService = new FakeWorkspaceService();

            var result = await WorkspaceEndpoints.HandleDeleteWorkspace(1, workspaceService);

            result.Should().BeOfType<NoContent>();
        }

        #endregion
    }
}