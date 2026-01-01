using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class TicketEndpoints
    {
        public static void MapTicketEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/tickets");

            group.MapPost("/", async (CreateTicketRequest request, TicketService service) =>
            {
                var id = await service.CreateTicketAsync(request);

                if (id == 0)
                    return Results.BadRequest("Failed to create a new ticket.");

                return Results.Ok(id);
            }).WithDescription("Create a new ticket and return its ID.");

            group.MapGet("/", async (TicketService service) =>
            {
                var tickets = await service.GetAllTicketsAsync();

                if (!tickets.Any())
                    return Results.NotFound("No tickets found.");

                return Results.Ok(tickets);
            }).WithDescription("Retrieve all tickets.");

            group.MapGet("/{id:long}", async (long id, TicketService service) =>
            {
                var ticket = await service.GetTicketByIdAsync(id);

                if (ticket == null)
                    return Results.NotFound("Ticket not found.");

                return Results.Ok(ticket);
            }).WithDescription("Retrieve a ticket by ID.");
        }
    }
}

