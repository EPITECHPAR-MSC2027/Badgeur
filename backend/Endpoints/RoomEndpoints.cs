using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class RoomEndpoints
    {
        public static void MapRoomEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/rooms");

            group.MapPost("/", async (CreateRoomRequest request, RoomService roomService) =>
            {
                var id = await roomService.CreateRoomAsync(request);

                if (id == null)
                    return Results.BadRequest("Failed to create a new room.");

                return Results.Ok(id);
            }).WithDescription("Create a new room. Upon success, returns the ID of the new room.");

            group.MapGet("/", async (RoomService roomService) =>
            {
                var rooms = await roomService.GetAllRoomsAsync();

                if (!rooms.Any()) return Results.NotFound("No rooms found.");

                return Results.Ok(rooms);
            }).WithDescription("Retrieve all the rooms.");

            group.MapGet("/{id:long}", async (long id, RoomService roomService) =>
            {
                var room = await roomService.GetRoomByIdAsync(id);

                if (room == null) return Results.NotFound("Room was not found.");

                return Results.Ok(room);
            }).WithDescription("Retrieve a room by ID.");

            group.MapGet("/floor/{floorId:long}", async (long floorId, RoomService roomService) =>
            {
                var rooms = await roomService.GetRoomsByFloorIdAsync(floorId);

                if (!rooms.Any()) return Results.NotFound("No rooms found for this floor.");

                return Results.Ok(rooms);
            }).WithDescription("Retrieve all rooms for a specific floor.");

            group.MapPut("/{id:long}", async (long id, UpdateRoomRequest updateRoomRequest, RoomService roomService) =>
            {
                var updatedRoom = await roomService.UpdateRoomAsync(id, updateRoomRequest);

                if (updatedRoom == null)
                    return Results.NotFound("Room not found");

                return Results.Ok(updatedRoom);
            }).WithDescription("Update the room's information.");

            group.MapDelete("/{id:long}", async (long id, RoomService roomService) =>
            {
                await roomService.DeleteRoomAsync(id);

                return Results.NoContent();
            }).WithDescription("Deletes a room by ID.");
        }
    }
}

