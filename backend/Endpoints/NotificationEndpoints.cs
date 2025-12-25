using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class NotificationEndpoints
    {
        public static void MapNotificationEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/notifications");

            group.MapGet("/user/{userId:long}", async (long userId, NotificationService service) =>
            {
                var notifications = await service.GetNotificationsByUserIdAsync(userId);
                return Results.Ok(notifications);
            }).WithDescription("Retrieve all notifications for a user.");

            group.MapGet("/user/{userId:long}/unread", async (long userId, NotificationService service) =>
            {
                var notifications = await service.GetUnreadNotificationsByUserIdAsync(userId);
                return Results.Ok(notifications);
            }).WithDescription("Retrieve unread notifications for a user.");

            group.MapGet("/{id:long}", async (long id, NotificationService service) =>
            {
                var notification = await service.GetNotificationByIdAsync(id);
                return notification is null ? Results.NotFound("Notification not found.") : Results.Ok(notification);
            }).WithDescription("Retrieve a notification by ID.");

            group.MapPut("/{id:long}", async (long id, UpdateNotificationRequest request, NotificationService service) =>
            {
                var updated = await service.UpdateNotificationAsync(id, request);
                return updated is null ? Results.NotFound("Notification not found.") : Results.Ok(updated);
            }).WithDescription("Update a notification by ID.");

            group.MapPut("/user/{userId:long}/mark-all-read", async (long userId, NotificationService service) =>
            {
                await service.MarkAllAsReadAsync(userId);
                return Results.Ok();
            }).WithDescription("Mark all notifications as read for a user.");

            group.MapDelete("/{id:long}", async (long id, NotificationService service) =>
            {
                await service.DeleteNotificationAsync(id);
                return Results.NoContent();
            }).WithDescription("Delete a notification by ID.");
        }
    }
}

