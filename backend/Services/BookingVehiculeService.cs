using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class BookingVehiculeService
    {
        private readonly Client _client;

        public BookingVehiculeService(Client client)
        {
            _client = client;
        }

        public async Task<long> CreateBookingVehiculeAsync(CreateBookingVehiculeRequest request)
        {
            var bookingVehicule = new BookingVehicule
            {
                IdVehicule = request.IdVehicule,
                UserId = request.UserId,
                StartDatetime = request.StartDatetime,
                EndDatetime = request.EndDatetime,
                CreatedAt = DateTime.UtcNow,
                Destination = request.Destination
            };

            var response = await _client.From<BookingVehicule>().Insert(bookingVehicule);
            return response.Models.First().IdBookingVehicule;
        }

        public async Task<List<BookingVehiculeResponse>> GetAllBookingVehiculesAsync()
        {
            var response = await _client.From<BookingVehicule>().Get();

            return response.Models.Select(b => CreateBookingVehiculeResponse(b)).ToList();
        }

        public async Task<BookingVehiculeResponse?> GetBookingVehiculeByIdAsync(long id)
        {
            var response = await _client.From<BookingVehicule>().Where(b => b.IdBookingVehicule == id).Get();
            var bookingVehicule = response.Models.FirstOrDefault();

            if (bookingVehicule == null) return null;

            return CreateBookingVehiculeResponse(bookingVehicule);
        }

        public async Task<List<BookingVehiculeResponse>> GetBookingVehiculesByUserIdAsync(long userId)
        {
            var response = await _client.From<BookingVehicule>().Where(b => b.UserId == userId).Get();

            return response.Models.Select(b => CreateBookingVehiculeResponse(b)).ToList();
        }

        public async Task<List<BookingVehiculeResponse>> GetBookingVehiculesByVehiculeIdAsync(long vehiculeId)
        {
            var response = await _client.From<BookingVehicule>().Where(b => b.IdVehicule == vehiculeId).Get();

            return response.Models.Select(b => CreateBookingVehiculeResponse(b)).ToList();
        }

        public async Task<BookingVehiculeResponse?> UpdateBookingVehiculeAsync(long id, UpdateBookingVehiculeRequest updateBookingVehiculeRequest)
        {
            var request = await _client.From<BookingVehicule>().Where(b => b.IdBookingVehicule == id).Get();
            var bookingVehicule = request.Models.FirstOrDefault();

            if (bookingVehicule == null) return null;

            bookingVehicule.IdVehicule = updateBookingVehiculeRequest.IdVehicule;
            bookingVehicule.UserId = updateBookingVehiculeRequest.UserId;
            bookingVehicule.StartDatetime = updateBookingVehiculeRequest.StartDatetime;
            bookingVehicule.EndDatetime = updateBookingVehiculeRequest.EndDatetime;
            bookingVehicule.Destination = updateBookingVehiculeRequest.Destination;

            request = await _client.From<BookingVehicule>().Update(bookingVehicule);

            return CreateBookingVehiculeResponse(bookingVehicule);
        }

        public async Task DeleteBookingVehiculeAsync(long id)
        {
            await _client.From<BookingVehicule>().Where(b => b.IdBookingVehicule == id).Delete();
        }

        public BookingVehiculeResponse CreateBookingVehiculeResponse(BookingVehicule bookingVehicule)
        {
            return new BookingVehiculeResponse
            {
                IdBookingVehicule = bookingVehicule.IdBookingVehicule,
                IdVehicule = bookingVehicule.IdVehicule,
                UserId = bookingVehicule.UserId,
                StartDatetime = bookingVehicule.StartDatetime,
                EndDatetime = bookingVehicule.EndDatetime,
                CreatedAt = bookingVehicule.CreatedAt,
                Destination = bookingVehicule.Destination
            };
        }
    }
}

