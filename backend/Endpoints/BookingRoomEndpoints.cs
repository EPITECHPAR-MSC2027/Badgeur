using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class BookingRoomEndpoints
    {
        public static void MapBookingRoomEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/booking-rooms");

            group.MapPost("/", async (CreateBookingRoomRequest request, BookingRoomService service, ILogger<BookingRoomService> logger) =>
            {
                try
                {
                    BookingRoomResponse bookingRoomResponse = await service.CreateBookingAsync(request);
                    var id = bookingRoomResponse.Id;

                    return Results.Ok(id);
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: 500,
                        title: "Error creating booking"
                    );
                }
            }).WithDescription("Créer une réservation de salle");

            group.MapGet("/", async (BookingRoomService service, ILogger<BookingRoomService> logger) =>
            {
                try
                {
                    var list = await service.GetAllAsync();
                    if (!list.Any()) return Results.NotFound("Aucune réservation.");
                    return Results.Ok(list);
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: 500,
                        title: "Error retrieving bookings"
                    );
                }
            }).WithDescription("Lister les réservations");

            group.MapGet("/{id:long}", async (long id, BookingRoomService service, ILogger<BookingRoomService> logger) =>
            {
                try
                {
                    var item = await service.GetByIdAsync(id);
                    return item is null ? Results.NotFound("Réservation introuvable.") : Results.Ok(item);
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: 500,
                        title: "Error retrieving booking"
                    );
                }
            }).WithDescription("Obtenir une réservation par id");

            group.MapPut("/{id:long}", async (long id, UpdateBookingRoomRequest request, BookingRoomService service, ILogger<BookingRoomService> logger) =>
            {
                try
                {
                    var updated = await service.UpdateBookingAsync(id, request);
                    return updated is null ? Results.NotFound("Réservation introuvable.") : Results.Ok(updated);
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: 500,
                        title: "Error updating booking"
                    );
                }
            }).WithDescription("Mettre à jour une réservation");

            group.MapDelete("/{id:long}", async (long id, BookingRoomService service, ILogger<BookingRoomService> logger) =>
            {
                try
                {
                    await service.DeleteBookingAsync(id);
                    return Results.NoContent();
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: 500,
                        title: "Error deleting booking"
                    );
                }
            }).WithDescription("Supprimer une réservation");

            group.MapGet("/{bookingId:long}/participants", async (long bookingId, BookingRoomService service, ILogger<BookingRoomService> logger) =>
            {
                try
                {
                    var list = await service.GetParticipantsByBookingAsync(bookingId);
                    return Results.Ok(list);
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: 500,
                        title: "Error retrieving participants"
                    );
                }
            }).WithDescription("Participants d'une réservation");

            group.MapPost("/participants", async (CreateBookingRoomParticipantRequest request, BookingRoomService service, ILogger<BookingRoomService> logger) =>
            {
                try
                {
                    var id = await service.AddParticipantAsync(request);

                    return Results.Ok(id);
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: 500,
                        title: "Error adding participant"
                    );
                }
            }).WithDescription("Ajouter un participant");

            group.MapGet("/rooms", async (BookingRoomService service, ILogger<BookingRoomService> logger) =>
            {
                try
                {
                    var rooms = await service.GetRoomsAsync();
                    if (!rooms.Any()) return Results.NotFound("Aucune salle.");
                    return Results.Ok(rooms);
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: 500,
                        title: "Error retrieving rooms"
                    );
                }
            }).WithDescription("Lister les salles");

            group.MapPost("/rooms", async (CreateRoomRequest request, BookingRoomService service, ILogger<BookingRoomService> logger) =>
            {
                try
                {
                    var id = await service.CreateRoomAsync(request);
                    return Results.Ok(id);
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: 500,
                        title: "Error creating room"
                    );
                }
            }).WithDescription("Créer une salle");
        }
    }
}