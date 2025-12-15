using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class BookingRoomEndpoints
    {
        public static void MapBookingRoomEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/booking-rooms");

            group.MapPost("/", async (CreateBookingRoomRequest request, BookingRoomService service) =>
            {
                var id = await service.CreateBookingAsync(request);
                return Results.Ok(id);
            }).WithDescription("Créer une réservation de salle");

            group.MapGet("/", async (BookingRoomService service) =>
            {
                var list = await service.GetAllAsync();
                if (!list.Any()) return Results.NotFound("Aucune réservation.");
                return Results.Ok(list);
            }).WithDescription("Lister les réservations");

            group.MapGet("/{id:long}", async (long id, BookingRoomService service) =>
            {
                var item = await service.GetByIdAsync(id);
                return item is null ? Results.NotFound("Réservation introuvable.") : Results.Ok(item);
            }).WithDescription("Obtenir une réservation par id");

            group.MapPut("/{id:long}", async (long id, UpdateBookingRoomRequest request, BookingRoomService service) =>
            {
                var updated = await service.UpdateBookingAsync(id, request);
                return updated is null ? Results.NotFound("Réservation introuvable.") : Results.Ok(updated);
            }).WithDescription("Mettre à jour une réservation");

            group.MapDelete("/{id:long}", async (long id, BookingRoomService service) =>
            {
                await service.DeleteBookingAsync(id);
                return Results.NoContent();
            }).WithDescription("Supprimer une réservation");

            group.MapGet("/{bookingId:long}/participants", async (long bookingId, BookingRoomService service) =>
            {
                var list = await service.GetParticipantsByBookingAsync(bookingId);
                return Results.Ok(list);
            }).WithDescription("Participants d'une réservation");

            group.MapPost("/participants", async (CreateBookingRoomParticipantRequest request, BookingRoomService service) =>
            {
                var id = await service.AddParticipantAsync(request);
                return Results.Ok(id);
            }).WithDescription("Ajouter un participant");

            group.MapGet("/rooms", async (BookingRoomService service) =>
            {
                var rooms = await service.GetRoomsAsync();
                if (!rooms.Any()) return Results.NotFound("Aucune salle.");
                return Results.Ok(rooms);
            }).WithDescription("Lister les salles");

            group.MapPost("/rooms", async (CreateRoomRequest request, BookingRoomService service) =>
            {
                var id = await service.CreateRoomAsync(request);
                return Results.Ok(id);
            }).WithDescription("Créer une salle");
        }
    }
}


