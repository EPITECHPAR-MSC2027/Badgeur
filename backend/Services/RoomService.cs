using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class RoomService
    {
        private readonly Client _client;

        public RoomService(Client client)
        {
            _client = client;
        }

        public async Task<long> CreateRoomAsync(CreateRoomRequest request)
        {
            var room = new Room
            {
                Name = request.Name,
                IdFloor = request.IdFloor,
                Capacity = request.Capacity,
                HasLargeScreen = request.HasLargeScreen,
                HasBoard = request.HasBoard,
                HasMic = request.HasMic
            };

            var response = await _client.From<Room>().Insert(room);
            return response.Models.First().Id;
        }


        public async Task<List<RoomResponse>> GetAllRoomsAsync()
        {
            var response = await _client.From<Room>().Get();

            return response.Models.Select(r => CreateRoomResponse(r)).ToList();
        }

        public async Task<RoomResponse?> GetRoomByIdAsync(long id)
        {
            var response = await _client.From<Room>().Where(r => r.Id == id).Get();
            var room = response.Models.FirstOrDefault();

            if (room == null) return null;

            return CreateRoomResponse(room);
        }

        public async Task<List<RoomResponse>> GetRoomsByFloorIdAsync(long floorId)
        {
            var response = await _client.From<Room>().Where(r => r.IdFloor == floorId).Get();

            return response.Models.Select(r => CreateRoomResponse(r)).ToList();
        }

        public async Task<RoomResponse?> UpdateRoomAsync(long id, UpdateRoomRequest updateRoomRequest)
        {
            var request = await _client.From<Room>().Where(r => r.Id == id).Get();
            var room = request.Models.FirstOrDefault();

            if (room == null) return null;

            room.Name = updateRoomRequest.Name;
            room.IdFloor = updateRoomRequest.IdFloor;

            request = await _client.From<Room>().Update(room);

            return CreateRoomResponse(room);
        }

        public async Task DeleteRoomAsync(long id)
        {
            await _client.From<Room>().Where(r => r.Id == id).Delete();
        }

        public RoomResponse CreateRoomResponse(Room room)
        {
            return new RoomResponse
            {
                Id = room.Id,
                Name = room.Name,
                IdFloor = room.IdFloor,
                Capacity = room.Capacity,
                HasLargeScreen = room.HasLargeScreen,
                HasBoard = room.HasBoard,
                HasMic = room.HasMic
            };
        }
    }
}

