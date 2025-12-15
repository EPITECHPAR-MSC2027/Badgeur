using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class WorkspaceService
    {
        private readonly Client _client;

        public WorkspaceService(Client client)
        {
            _client = client;
        }

        public virtual async Task<long> CreateWorkspaceAsync(CreateWorkspaceRequest request)
        {
            var workspace = new Workspace
            {
                Number = request.Number,
                IdFloor = request.IdFloor
            };

            var response = await _client.From<Workspace>().Insert(workspace);
            return response.Models.First().Id;
        }

        public virtual async Task<List<WorkspaceResponse>> GetAllWorkspacesAsync()
        {
            var response = await _client.From<Workspace>().Get();

            return response.Models.Select(w => CreateWorkspaceResponse(w)).ToList();
        }

        public virtual async Task<WorkspaceResponse?> GetWorkspaceByIdAsync(long id)
        {
            var response = await _client.From<Workspace>().Where(w => w.Id == id).Get();
            var workspace = response.Models.FirstOrDefault();

            if (workspace == null) return null;

            return CreateWorkspaceResponse(workspace);
        }

        public virtual async Task<List<WorkspaceResponse>> GetWorkspacesByFloorIdAsync(long floorId)
        {
            var response = await _client.From<Workspace>().Where(w => w.IdFloor == floorId).Get();

            return response.Models.Select(w => CreateWorkspaceResponse(w)).ToList();
        }

        public virtual async Task<WorkspaceResponse?> UpdateWorkspaceAsync(long id, UpdateWorkspaceRequest updateWorkspaceRequest)
        {
            var request = await _client.From<Workspace>().Where(w => w.Id == id).Get();
            var workspace = request.Models.FirstOrDefault();

            if (workspace == null) return null;

            workspace.Number = updateWorkspaceRequest.Number;
            workspace.IdFloor = updateWorkspaceRequest.IdFloor;

            request = await _client.From<Workspace>().Update(workspace);

            return CreateWorkspaceResponse(workspace);
        }

        public virtual async Task DeleteWorkspaceAsync(long id)
        {
            await _client.From<Workspace>().Where(w => w.Id == id).Delete();
        }


        public WorkspaceResponse CreateWorkspaceResponse(Workspace workspace)
        {
            return new WorkspaceResponse
            {
                Id = workspace.Id,
                Number = workspace.Number,
                IdFloor = workspace.IdFloor
            };
        }
    }
}

