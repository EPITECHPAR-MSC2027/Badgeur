using badgeur_backend.Contracts.Requests;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class BadgeLogEventEndpoints
    {
        public static void MapBadgeLogEventEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/badgeLogEvent");

            group.MapPost("/", async (CreateBadgeLogEventRequest request, BadgeLogEventService badgeLogEventService) =>
            {
                var id = await badgeLogEventService.CreateBadgeLogEventAsync(request);

                if (id == null)
                    return Results.BadRequest("Failed to create a new badge log event.");

                return Results.Ok(id);
            }).WithDescription("Create a new badge log event.Upon success, returns the ID of the new badge log event.");

            group.MapGet("/", async (BadgeLogEventService badgeLogEventService) =>
            {
                var badgeLogEvents = await badgeLogEventService.GetAllBadgeLogEventsAsync();

                if (!badgeLogEvents.Any()) return Results.NotFound("No badge log events found.");

                return Results.Ok(badgeLogEvents);
            }).WithDescription("Retrieves all badge log events.");

            group.MapGet("/{id:long}", async (long id, BadgeLogEventService badgeLogEventService) =>
            {
                var badgeLogEvent = await badgeLogEventService.GetBadgeLogEventByIdAsync(id);

                if (badgeLogEvent == null) return Results.NotFound("Badge log event was not found.");

                return Results.Ok(badgeLogEvent);
            }).WithDescription("Retrieve a badge log event by ID.");

            group.MapDelete("/{id:long}", async (long id, BadgeLogEventService badgeLogEventService) =>
            {
                await badgeLogEventService.DeleteBadgeLogEventAsync(id);
                return Results.NoContent();
            }).WithDescription("Delete a badge log event by ID.");
        }
    }
}