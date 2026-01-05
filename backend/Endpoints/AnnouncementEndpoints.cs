using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class AnnouncementEndpoints
    {
        public static void MapAnnouncementEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/announcements");

            group.MapPost("/", async (CreateAnnouncementRequest request, AnnouncementService service) =>
            {
                var id = await service.CreateAnnouncementAsync(request);

                if (id == 0)
                    return Results.BadRequest("Failed to create a new announcement.");

                return Results.Ok(id);
            }).WithDescription("Create a new announcement and return its ID.");

            group.MapGet("/", async (AnnouncementService service) =>
            {
                var announcements = await service.GetAllAnnouncementsAsync();

                if (!announcements.Any())
                    return Results.NotFound("No announcements found.");

                return Results.Ok(announcements);
            }).WithDescription("Retrieve all announcements.");

            group.MapGet("/{id:long}", async (long id, AnnouncementService service) =>
            {
                var announcement = await service.GetAnnouncementByIdAsync(id);

                if (announcement == null)
                    return Results.NotFound("Announcement not found.");

                return Results.Ok(announcement);
            }).WithDescription("Retrieve an announcement by ID.");

            group.MapPut("/{id:long}", async (long id, UpdateAnnouncementRequest request, AnnouncementService service) =>
            {
                var updated = await service.UpdateAnnouncementAsync(id, request);

                if (updated == null)
                    return Results.NotFound("Announcement not found.");

                return Results.Ok(updated);
            }).WithDescription("Update an announcement by ID.");

            group.MapDelete("/{id:long}", async (long id, AnnouncementService service) =>
            {
                await service.DeleteAnnouncementAsync(id);
                return Results.NoContent();
            }).WithDescription("Delete an announcement by ID.");
        }
    }
}

