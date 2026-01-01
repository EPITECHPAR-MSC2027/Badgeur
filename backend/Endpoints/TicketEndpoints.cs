using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Services;
using Supabase;
using Microsoft.AspNetCore.Http.HttpResults;

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

            group.MapGet("/my", async (TicketService ticketService, UserService userService, HttpContext context) =>
            {
                return await HandleGetMyTickets(ticketService, userService, context);
            }).WithDescription("Retrieve tickets assigned to the authenticated user based on their role (Admin: IT support, RH: RH).");

            group.MapPut("/{id:long}/status", async (long id, UpdateTicketStatusRequest request, TicketService service) =>
            {
                var success = await service.UpdateTicketStatusAsync(id, request.Status);

                if (!success)
                    return Results.NotFound("Ticket not found.");

                return Results.Ok(new { message = "Ticket status updated successfully." });
            }).WithDescription("Update the status of a ticket.");
        }

        public static async Task<IResult> HandleGetMyTickets(
            TicketService ticketService,
            UserService userService,
            HttpContext context)
        {
            // Récupérer l'utilisateur connecté depuis le middleware
            var authenticatedUser = context.Items["User"] as Supabase.Gotrue.User;
            if (authenticatedUser == null)
            {
                return Results.Unauthorized();
            }

            // Récupérer les informations de l'utilisateur connecté depuis la base de données
            var connectedUser = await userService.GetUserByEmailAsync(authenticatedUser.Email ?? "");

            if (connectedUser == null)
            {
                return Results.Unauthorized();
            }

            // Déterminer le assigned_to selon le role_id
            string assignedTo;
            if (connectedUser.RoleId == 2) // Admin
            {
                assignedTo = "IT support";
            }
            else if (connectedUser.RoleId == 3) // RH
            {
                assignedTo = "RH";
            }
            else
            {
                return Results.Forbid();
            }

            var tickets = await ticketService.GetTicketsByAssignedToAsync(assignedTo);

            return Results.Ok(tickets);
        }
    }
}

