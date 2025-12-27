using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class WorkspaceEndpoints
    {
        public static void MapWorkspaceEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/workspaces");

            group.MapPost("/", HandleCreateWorkspace)
                .WithDescription("Create a new workspace. Upon success, returns the ID of the new workspace.");

            group.MapGet("/", HandleGetAllWorkspaces)
                .WithDescription("Retrieve all the workspaces.");

            group.MapGet("/{id:long}", HandleGetWorkspaceById)
                .WithDescription("Retrieve a workspace by ID.");

            group.MapGet("/floor/{floorId:long}", HandleGetWorkspacesByFloorId)
                .WithDescription("Retrieve all workspaces for a specific floor.");

            group.MapPut("/{id:long}", HandleUpdateWorkspace)
                .WithDescription("Update the workspace's information.");

            group.MapDelete("/{id:long}", HandleDeleteWorkspace)
                .WithDescription("Deletes a workspace by ID.");
        }

        public static async Task<IResult> HandleCreateWorkspace(CreateWorkspaceRequest request, WorkspaceService workspaceService)
        {
            var id = await workspaceService.CreateWorkspaceAsync(request);

            if (id == 0)
                return Results.BadRequest("Failed to create a new workspace.");

            return Results.Ok(id);
        }

        public static async Task<IResult> HandleGetAllWorkspaces(WorkspaceService workspaceService)
        {
            var workspaces = await workspaceService.GetAllWorkspacesAsync();

            if (!workspaces.Any()) return Results.NotFound("No workspaces found.");

            return Results.Ok(workspaces);
        }

        public static async Task<IResult> HandleGetWorkspaceById(long id, WorkspaceService workspaceService)
        {
            var workspace = await workspaceService.GetWorkspaceByIdAsync(id);

            if (workspace == null) return Results.NotFound("Workspace was not found.");

            return Results.Ok(workspace);
        }

        public static async Task<IResult> HandleGetWorkspacesByFloorId(long floorId, WorkspaceService workspaceService)
        {
            var workspaces = await workspaceService.GetWorkspacesByFloorIdAsync(floorId);

            if (!workspaces.Any()) return Results.NotFound("No workspaces found for this floor.");

            return Results.Ok(workspaces);
        }

        public static async Task<IResult> HandleUpdateWorkspace(long id, UpdateWorkspaceRequest updateWorkspaceRequest, WorkspaceService workspaceService)
        {
            var updatedWorkspace = await workspaceService.UpdateWorkspaceAsync(id, updateWorkspaceRequest);

            if (updatedWorkspace == null)
                return Results.NotFound("Workspace not found");

            return Results.Ok(updatedWorkspace);
        }

        public static async Task<IResult> HandleDeleteWorkspace(long id, WorkspaceService workspaceService)
        {
            await workspaceService.DeleteWorkspaceAsync(id);

            return Results.NoContent();
        }
    }
}