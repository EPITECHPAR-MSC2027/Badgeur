using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Endpoints;
using badgeur_backend.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http.HttpResults;

namespace badgeur_backend_tests.Endpoints
{
    public class RoomEndpointsTests
    {
        private sealed class FakeRoomService : RoomService
        {
            private readonly long _createRoomId;
            private readonly List<RoomResponse> _rooms;
            private readonly RoomResponse? _room;
            private readonly RoomResponse? _updatedRoom;

            public FakeRoomService(
                long createRoomId = 0,
                List<RoomResponse>? rooms = null,
                RoomResponse? room = null,
                RoomResponse? updatedRoom = null) : base(null!)
            {
                _createRoomId = createRoomId;
                _rooms = rooms ?? new List<RoomResponse>();
                _room = room;
                _updatedRoom = updatedRoom;
            }

            public override async Task<long> CreateRoomAsync(CreateRoomRequest request)
            {
                return await Task.FromResult(_createRoomId);
            }

            public override async Task<List<RoomResponse>> GetAllRoomsAsync()
            {
                return await Task.FromResult(_rooms);
            }

            public override async Task<RoomResponse?> GetRoomByIdAsync(long id)
            {
                return await Task.FromResult(_room);
            }

            public override async Task<List<RoomResponse>> GetRoomsByFloorIdAsync(long floorId)
            {
                return await Task.FromResult(_rooms);
            }

            public override async Task<RoomResponse?> UpdateRoomAsync(long id, UpdateRoomRequest updateRoomRequest)
            {
                return await Task.FromResult(_updatedRoom);
            }

            public override async Task DeleteRoomAsync(long id)
            {
                await Task.CompletedTask;
            }
        }

        #region CreateRoom Tests

        [Fact]
        public async Task HandleCreateRoom_Returns_BadRequest_When_Creation_Fails()
        {
            var request = new CreateRoomRequest { Name = "Conference Room A", IdFloor = 1 };
            var roomService = new FakeRoomService(createRoomId: 0);

            var result = await RoomEndpoints.HandleCreateRoom(request, roomService);

            result.Should().BeOfType<BadRequest<string>>();
            var badRequest = (BadRequest<string>)result;
            badRequest.Value.Should().Be("Failed to create a new room.");
        }

        [Fact]
        public async Task HandleCreateRoom_Returns_Ok_With_RoomId_On_Success()
        {
            var request = new CreateRoomRequest { Name = "Conference Room A", IdFloor = 1 };
            var roomService = new FakeRoomService(createRoomId: 42);

            var result = await RoomEndpoints.HandleCreateRoom(request, roomService);

            result.Should().BeOfType<Ok<long>>();
            var ok = (Ok<long>)result;
            ok.Value.Should().Be(42);
        }

        #endregion

        #region GetAllRooms Tests

        [Fact]
        public async Task HandleGetAllRooms_Returns_NotFound_When_No_Rooms_Exist()
        {
            var roomService = new FakeRoomService(rooms: new List<RoomResponse>());

            var result = await RoomEndpoints.HandleGetAllRooms(roomService);

            result.Should().BeOfType<NotFound<string>>();
            var notFound = (NotFound<string>)result;
            notFound.Value.Should().Be("No rooms found.");
        }

        [Fact]
        public async Task HandleGetAllRooms_Returns_Ok_With_RoomList_On_Success()
        {
            var rooms = new List<RoomResponse>
            {
                new RoomResponse { Id = 1, Name = "Conference Room A", IdFloor = 1 },
                new RoomResponse { Id = 2, Name = "Meeting Room B", IdFloor = 1 },
                new RoomResponse { Id = 3, Name = "Office 301", IdFloor = 3 }
            };
            var roomService = new FakeRoomService(rooms: rooms);

            var result = await RoomEndpoints.HandleGetAllRooms(roomService);

            result.Should().BeOfType<Ok<List<RoomResponse>>>();
            var ok = (Ok<List<RoomResponse>>)result;
            ok.Value.Should().HaveCount(3);
            ok.Value![0].Name.Should().Be("Conference Room A");
            ok.Value![1].IdFloor.Should().Be(1);
            ok.Value![2].Id.Should().Be(3);
        }

        #endregion

        #region GetRoomById Tests

        [Fact]
        public async Task HandleGetRoomById_Returns_NotFound_When_Room_Does_Not_Exist()
        {
            var roomService = new FakeRoomService(room: null);

            var result = await RoomEndpoints.HandleGetRoomById(999, roomService);

            result.Should().BeOfType<NotFound<string>>();
            var notFound = (NotFound<string>)result;
            notFound.Value.Should().Be("Room was not found.");
        }

        [Fact]
        public async Task HandleGetRoomById_Returns_Ok_With_Room_On_Success()
        {
            var room = new RoomResponse { Id = 1, Name = "Conference Room A", IdFloor = 2 };
            var roomService = new FakeRoomService(room: room);

            var result = await RoomEndpoints.HandleGetRoomById(1, roomService);

            result.Should().BeOfType<Ok<RoomResponse>>();
            var ok = (Ok<RoomResponse>)result;
            ok.Value.Should().NotBeNull();
            ok.Value!.Id.Should().Be(1);
            ok.Value!.Name.Should().Be("Conference Room A");
            ok.Value!.IdFloor.Should().Be(2);
        }

        #endregion

        #region GetRoomsByFloorId Tests

        [Fact]
        public async Task HandleGetRoomsByFloorId_Returns_NotFound_When_No_Rooms_Found()
        {
            var roomService = new FakeRoomService(rooms: new List<RoomResponse>());

            var result = await RoomEndpoints.HandleGetRoomsByFloorId(5, roomService);

            result.Should().BeOfType<NotFound<string>>();
            var notFound = (NotFound<string>)result;
            notFound.Value.Should().Be("No rooms found for this floor.");
        }

        [Fact]
        public async Task HandleGetRoomsByFloorId_Returns_Ok_With_RoomList_On_Success()
        {
            var rooms = new List<RoomResponse>
            {
                new RoomResponse { Id = 1, Name = "Conference Room A", IdFloor = 2 },
                new RoomResponse { Id = 2, Name = "Meeting Room B", IdFloor = 2 },
                new RoomResponse { Id = 3, Name = "Office 201", IdFloor = 2 }
            };
            var roomService = new FakeRoomService(rooms: rooms);

            var result = await RoomEndpoints.HandleGetRoomsByFloorId(2, roomService);

            result.Should().BeOfType<Ok<List<RoomResponse>>>();
            var ok = (Ok<List<RoomResponse>>)result;
            ok.Value.Should().HaveCount(3);
            ok.Value!.Should().AllSatisfy(r => r.IdFloor.Should().Be(2));
        }

        #endregion

        #region UpdateRoom Tests

        [Fact]
        public async Task HandleUpdateRoom_Returns_NotFound_When_Room_Does_Not_Exist()
        {
            var request = new UpdateRoomRequest { Name = "Updated Room", IdFloor = 3 };
            var roomService = new FakeRoomService(updatedRoom: null);

            var result = await RoomEndpoints.HandleUpdateRoom(999, request, roomService);

            result.Should().BeOfType<NotFound<string>>();
            var notFound = (NotFound<string>)result;
            notFound.Value.Should().Be("Room not found");
        }

        [Fact]
        public async Task HandleUpdateRoom_Returns_Ok_With_UpdatedRoom_On_Success()
        {
            var request = new UpdateRoomRequest { Name = "Updated Conference Room", IdFloor = 5 };
            var updatedRoom = new RoomResponse { Id = 1, Name = "Updated Conference Room", IdFloor = 5 };
            var roomService = new FakeRoomService(updatedRoom: updatedRoom);

            var result = await RoomEndpoints.HandleUpdateRoom(1, request, roomService);

            result.Should().BeOfType<Ok<RoomResponse>>();
            var ok = (Ok<RoomResponse>)result;
            ok.Value.Should().NotBeNull();
            ok.Value!.Id.Should().Be(1);
            ok.Value!.Name.Should().Be("Updated Conference Room");
            ok.Value!.IdFloor.Should().Be(5);
        }

        #endregion

        #region DeleteRoom Tests

        [Fact]
        public async Task HandleDeleteRoom_Returns_NoContent_On_Success()
        {
            var roomService = new FakeRoomService();

            var result = await RoomEndpoints.HandleDeleteRoom(1, roomService);

            result.Should().BeOfType<NoContent>();
        }

        #endregion
    }
}