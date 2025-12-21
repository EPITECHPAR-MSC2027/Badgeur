using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
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
                return await HandleCreateBadgeLogEvent(request, badgeLogEventService);
            }).WithDescription("Create a new badge log event. Upon success, returns the ID of the new badge log event.");

            group.MapGet("/", async (BadgeLogEventService badgeLogEventService) =>
            {
                return await HandleGetAllBadgeLogEvents(badgeLogEventService);
            }).WithDescription("Retrieves all badge log events.");

            group.MapGet("/{id:long}", async (long id, BadgeLogEventService badgeLogEventService) =>
            {
                return await HandleGetBadgeLogEventById(id, badgeLogEventService);
            }).WithDescription("Retrieve a badge log event by ID.");

            group.MapGet("/user/{userId:long}", async (long userId, BadgeLogEventService badgeLogEventService) =>
            {
                return await HandleGetBadgeLogEventsByUserId(userId, badgeLogEventService);
            }).WithDescription("Retrieves all badge log events submitted by a user.");

            group.MapPut("/{id:long}", async (long id, UpdateBadgeLogEventRequest request, BadgeLogEventService badgeLogEventService) =>
            {
                return await HandleUpdateBadgeLogEvent(id, request, badgeLogEventService);
            });

            group.MapDelete("/{id:long}", async (long id, BadgeLogEventService badgeLogEventService) =>
            {
                return await HandleDeleteBadgeLogEvent(id, badgeLogEventService);
            }).WithDescription("Delete a badge log event by ID.");
        }

        public static async Task<IResult> HandleCreateBadgeLogEvent(CreateBadgeLogEventRequest request, BadgeLogEventService badgeLogEventService)
        {
            var id = await badgeLogEventService.CreateBadgeLogEventAsync(request);

            if (id == null || id == 0)
                return Results.BadRequest("Failed to create a new badge log event.");

            return Results.Ok(id);
        }

        public static async Task<IResult> HandleGetAllBadgeLogEvents(BadgeLogEventService badgeLogEventService)
        {
            var badgeLogEvents = await badgeLogEventService.GetAllBadgeLogEventsAsync();

            if (!badgeLogEvents.Any()) return Results.NotFound("No badge log events found.");

            return Results.Ok(badgeLogEvents);
        }

        public static async Task<IResult> HandleGetBadgeLogEventById(long id, BadgeLogEventService badgeLogEventService)
        {
            var badgeLogEvent = await badgeLogEventService.GetBadgeLogEventByIdAsync(id);

            if (badgeLogEvent == null) return Results.NotFound("Badge log event was not found.");

            return Results.Ok(badgeLogEvent);
        }

        public static async Task<IResult> HandleGetBadgeLogEventsByUserId(long userId, BadgeLogEventService badgeLogEventService)
        {
            var badgeLogEvents = await badgeLogEventService.GetBadgeLogEventsByUserIdAsync(userId);

            if (!badgeLogEvents.Any()) return Results.NotFound("No badge log events found for this user.");

            return Results.Ok(badgeLogEvents);
        }

        public static async Task<IResult> HandleUpdateBadgeLogEvent(long id, UpdateBadgeLogEventRequest request, BadgeLogEventService badgeLogEventService)
        {
            var updatedBadgeLogEvent = await badgeLogEventService.UpdateBadgeLogEventAsync(id, request);

            if (updatedBadgeLogEvent == null)
                return Results.NotFound("Badge log event not found");

            return Results.Ok(updatedBadgeLogEvent);
        }

        public static async Task<IResult> HandleDeleteBadgeLogEvent(long id, BadgeLogEventService badgeLogEventService)
        {
            await badgeLogEventService.DeleteBadgeLogEventAsync(id);
            return Results.NoContent();
        }
    }
}