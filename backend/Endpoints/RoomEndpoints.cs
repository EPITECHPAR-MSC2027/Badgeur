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

            group.MapPost("/", HandleCreateRoom)
                .WithDescription("Create a new room. Upon success, returns the ID of the new room.");

            group.MapGet("/", HandleGetAllRooms)
                .WithDescription("Retrieve all the rooms.");

            group.MapGet("/{id:long}", HandleGetRoomById)
                .WithDescription("Retrieve a room by ID.");

            group.MapGet("/floor/{floorId:long}", HandleGetRoomsByFloorId)
                .WithDescription("Retrieve all rooms for a specific floor.");

            group.MapPut("/{id:long}", HandleUpdateRoom)
                .WithDescription("Update the room's information.");

            group.MapDelete("/{id:long}", HandleDeleteRoom)
                .WithDescription("Deletes a room by ID.");
        }

        public static async Task<IResult> HandleCreateRoom(CreateRoomRequest request, RoomService roomService)
        {
            var id = await roomService.CreateRoomAsync(request);

            if (id == 0)
                return Results.BadRequest("Failed to create a new room.");

            return Results.Ok(id);
        }

        public static async Task<IResult> HandleGetAllRooms(RoomService roomService)
        {
            var rooms = await roomService.GetAllRoomsAsync();

            if (!rooms.Any()) return Results.NotFound("No rooms found.");

            return Results.Ok(rooms);
        }

        public static async Task<IResult> HandleGetRoomById(long id, RoomService roomService)
        {
            var room = await roomService.GetRoomByIdAsync(id);

            if (room == null) return Results.NotFound("Room was not found.");

            return Results.Ok(room);
        }

        public static async Task<IResult> HandleGetRoomsByFloorId(long floorId, RoomService roomService)
        {
            var rooms = await roomService.GetRoomsByFloorIdAsync(floorId);

            if (!rooms.Any()) return Results.NotFound("No rooms found for this floor.");

            return Results.Ok(rooms);
        }

        public static async Task<IResult> HandleUpdateRoom(long id, UpdateRoomRequest updateRoomRequest, RoomService roomService)
        {
            var updatedRoom = await roomService.UpdateRoomAsync(id, updateRoomRequest);

            if (updatedRoom == null)
                return Results.NotFound("Room not found");

            return Results.Ok(updatedRoom);
        }

        public static async Task<IResult> HandleDeleteRoom(long id, RoomService roomService)
        {
            await roomService.DeleteRoomAsync(id);

            return Results.NoContent();
        }
    }
}