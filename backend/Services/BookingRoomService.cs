using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class BookingRoomService
    {
        private readonly Client _client;

        public BookingRoomService(Client client)
        {
            _client = client;
        }
        // APRÈS (retourne l'objet complet)
        public async Task<BookingRoomResponse> CreateBookingAsync(CreateBookingRoomRequest request)
        {
            var booking = new BookingRoom
            {
                UserId = request.UserId,
                RoomId = request.RoomId,
                Title = request.Title,
                StartDatetime = request.StartDatetime,
                EndDatetime = request.EndDatetime,
                CreatedAt = DateTime.UtcNow
            };

            var response = await _client.From<BookingRoom>().Insert(booking);
            var created = response.Models.First();
            return CreateBookingRoomResponse(created);
        }

        public async Task<List<BookingRoomResponse>> GetAllAsync()
        {
            var response = await _client.From<BookingRoom>().Get();
            return response.Models.Select(CreateBookingRoomResponse).ToList();
        }

        public async Task<BookingRoomResponse?> GetByIdAsync(long id)
        {
            var response = await _client.From<BookingRoom>().Where(b => b.Id == id).Get();
            var booking = response.Models.FirstOrDefault();
            if (booking == null) return null;
            return CreateBookingRoomResponse(booking);
        }

        public async Task<BookingRoomResponse?> UpdateBookingAsync(long id, UpdateBookingRoomRequest request)
        {
            var query = await _client.From<BookingRoom>().Where(b => b.Id == id).Get();
            var booking = query.Models.FirstOrDefault();
            if (booking == null) return null;

            booking.RoomId = request.RoomId;
            booking.Title = request.Title;
            booking.StartDatetime = request.StartDatetime;
            booking.EndDatetime = request.EndDatetime;

            await _client.From<BookingRoom>().Update(booking);
            return CreateBookingRoomResponse(booking);
        }

        public async Task DeleteBookingAsync(long id)
        {
            await _client.From<BookingRoom>().Where(b => b.Id == id).Delete();
        }

        public async Task<long> AddParticipantAsync(CreateBookingRoomParticipantRequest request)
        {
            var participant = new BookingRoomParticipant
            {
                BookingId = request.BookingId,
                UserId = request.UserId,
                Role = request.Role,
                Status = request.Status
            };

            var response = await _client.From<BookingRoomParticipant>().Insert(participant);
            return response.Models.First().Id;
        }

        public async Task<List<BookingRoomParticipantResponse>> GetParticipantsByBookingAsync(long bookingId)
        {
            var response = await _client.From<BookingRoomParticipant>().Where(p => p.BookingId == bookingId).Get();
            return response.Models.Select(CreateParticipantResponse).ToList();
        }

        public async Task<List<RoomResponse>> GetRoomsAsync()
        {
            var response = await _client.From<Room>().Get();
            return response.Models.Select(CreateRoomResponse).ToList();
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

        public BookingRoomResponse CreateBookingRoomResponse(BookingRoom booking)
        {
            return new BookingRoomResponse
            {
                Id = booking.Id,
                UserId = booking.UserId,
                RoomId = booking.RoomId,
                Title = booking.Title,
                StartDatetime = booking.StartDatetime,
                EndDatetime = booking.EndDatetime,
                CreatedAt = booking.CreatedAt
            };
        }

        public BookingRoomParticipantResponse CreateParticipantResponse(BookingRoomParticipant participant)
        {
            return new BookingRoomParticipantResponse
            {
                Id = participant.Id,
                BookingId = participant.BookingId,
                UserId = participant.UserId,
                Role = participant.Role,
                Status = participant.Status
            };
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


