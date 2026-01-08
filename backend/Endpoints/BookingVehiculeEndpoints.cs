using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class BookingVehiculeEndpoints
    {
        public static void MapBookingVehiculeEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/booking-vehicules");

            group.MapPost("/", async (CreateBookingVehiculeRequest request, BookingVehiculeService bookingVehiculeService, VehiculeService vehiculeService) =>
            {
                // Vérifier que le véhicule existe
                var vehicule = await vehiculeService.GetVehiculeByIdAsync(request.IdVehicule);
                if (vehicule == null)
                    return Results.BadRequest("Vehicule not found.");

                // Vérifier que les dates sont valides
                if (request.StartDatetime >= request.EndDatetime)
                    return Results.BadRequest("Start datetime must be before end datetime.");

                // Vérifier les conflits de réservation
                var existingBookings = await bookingVehiculeService.GetBookingVehiculesByVehiculeIdAsync(request.IdVehicule);
                var hasConflict = existingBookings.Any(b =>
                    (request.StartDatetime >= b.StartDatetime && request.StartDatetime < b.EndDatetime) ||
                    (request.EndDatetime > b.StartDatetime && request.EndDatetime <= b.EndDatetime) ||
                    (request.StartDatetime <= b.StartDatetime && request.EndDatetime >= b.EndDatetime)
                );

                if (hasConflict)
                    return Results.BadRequest("Vehicule is already booked for this time period.");

                long? id = await bookingVehiculeService.CreateBookingVehiculeAsync(request);

                if (id == null)
                    return Results.BadRequest("Failed to create a new booking.");

                return Results.Ok(id);
            }).WithDescription("Create a new vehicule booking and returns the booking ID.");

            group.MapGet("/", async (BookingVehiculeService bookingVehiculeService) =>
            {
                var bookings = await bookingVehiculeService.GetAllBookingVehiculesAsync();

                if (!bookings.Any()) return Results.NotFound("No bookings found.");

                return Results.Ok(bookings);
            }).WithDescription("Retrieves all vehicule bookings from the database.");

            group.MapGet("/{id:long}", async (long id, BookingVehiculeService bookingVehiculeService) =>
            {
                var booking = await bookingVehiculeService.GetBookingVehiculeByIdAsync(id);

                if (booking == null) return Results.NotFound("Booking was not found.");

                return Results.Ok(booking);
            }).WithDescription("Retrieve a booking by its ID.");

            group.MapGet("/user/{userId:long}", async (long userId, BookingVehiculeService bookingVehiculeService) =>
            {
                var bookings = await bookingVehiculeService.GetBookingVehiculesByUserIdAsync(userId);

                if (!bookings.Any()) return Results.NotFound("No bookings found for this user.");

                return Results.Ok(bookings);
            }).WithDescription("Retrieve all bookings for a specific user.");

            group.MapGet("/vehicule/{vehiculeId:long}", async (long vehiculeId, BookingVehiculeService bookingVehiculeService) =>
            {
                var bookings = await bookingVehiculeService.GetBookingVehiculesByVehiculeIdAsync(vehiculeId);

                if (!bookings.Any()) return Results.NotFound("No bookings found for this vehicule.");

                return Results.Ok(bookings);
            }).WithDescription("Retrieve all bookings for a specific vehicule.");

            group.MapPut("/{id:long}", async (long id, UpdateBookingVehiculeRequest request, BookingVehiculeService bookingVehiculeService, VehiculeService vehiculeService) =>
            {
                // Vérifier que le véhicule existe
                var vehicule = await vehiculeService.GetVehiculeByIdAsync(request.IdVehicule);
                if (vehicule == null)
                    return Results.BadRequest("Vehicule not found.");

                // Vérifier que les dates sont valides
                if (request.StartDatetime >= request.EndDatetime)
                    return Results.BadRequest("Start datetime must be before end datetime.");

                // Vérifier les conflits de réservation (en excluant la réservation actuelle)
                var existingBookings = await bookingVehiculeService.GetBookingVehiculesByVehiculeIdAsync(request.IdVehicule);
                var hasConflict = existingBookings
                    .Where(b => b.IdBookingVehicule != id)
                    .Any(b =>
                        (request.StartDatetime >= b.StartDatetime && request.StartDatetime < b.EndDatetime) ||
                        (request.EndDatetime > b.StartDatetime && request.EndDatetime <= b.EndDatetime) ||
                        (request.StartDatetime <= b.StartDatetime && request.EndDatetime >= b.EndDatetime)
                    );

                if (hasConflict)
                    return Results.BadRequest("Vehicule is already booked for this time period.");

                var updatedBooking = await bookingVehiculeService.UpdateBookingVehiculeAsync(id, request);

                if (updatedBooking == null)
                    return Results.NotFound("Booking not found");

                return Results.Ok(updatedBooking);
            }).WithDescription("Update the booking's information");

            group.MapDelete("/{id:long}", async (long id, BookingVehiculeService bookingVehiculeService) =>
            {
                await bookingVehiculeService.DeleteBookingVehiculeAsync(id);

                return Results.NoContent();
            }).WithDescription("Delete a booking by its ID.");
        }
    }
}

