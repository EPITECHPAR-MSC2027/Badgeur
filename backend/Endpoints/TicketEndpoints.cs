using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Supabase;
using System;
using System.Threading.Tasks;
using badgeur_backend.Models;

namespace badgeur_backend.Endpoints
{
    public static class TicketEndpoints
    {
        public static void MapTicketEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/tickets");

            group.MapPost("/", async (CreateTicketRequest request, TicketService ticketService, UserService userService, HttpContext context) =>
            {
                return await HandleCreateTicket(request, ticketService, userService, context);
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

            group.MapGet("/my", HandleGetMyTickets)
                .WithDescription("Retrieve all tickets. The frontend will filter based on user role_id.");

            group.MapPut("/{id:long}/status", async (long id, UpdateTicketStatusRequest request, TicketService service) =>
            {
                var success = await service.UpdateTicketStatusAsync(id, request.Status);

                if (!success)
                    return Results.NotFound("Ticket not found.");

                return Results.Ok(new { message = "Ticket status updated successfully." });
            }).WithDescription("Update the status of a ticket.");
        }

        public static async Task<IResult> HandleCreateTicket(
            CreateTicketRequest request,
            TicketService ticketService,
            UserService userService,
            HttpContext context)
        {
            // Récupérer l'utilisateur connecté depuis le middleware
            var authenticatedUser = context.Items["User"] as Supabase.Gotrue.User;
            
            // Si l'utilisateur est connecté, utiliser ses informations
            if (authenticatedUser != null && !string.IsNullOrEmpty(authenticatedUser.Email))
            {
                var connectedUser = await userService.GetUserByEmailAsync(authenticatedUser.Email);
                
                if (connectedUser != null)
                {
                    // Remplir automatiquement les champs avec les informations de l'utilisateur connecté
                    request.UserName = string.IsNullOrEmpty(request.UserName) ? connectedUser.FirstName : request.UserName;
                    request.UserLastName = string.IsNullOrEmpty(request.UserLastName) ? connectedUser.LastName : request.UserLastName;
                    request.UserEmail = string.IsNullOrEmpty(request.UserEmail) ? connectedUser.Email : request.UserEmail;
                    
                    // Si assigned_to n'est pas fourni, déterminer selon la catégorie
                    if (string.IsNullOrEmpty(request.AssignedTo))
                    {
                        // Catégories IT support
                        var itCategories = new[] { "Problème de connexion", "Problème technique", "Demande d'accès", "Bug/Erreur", "Question générale", "Autre" };
                        // Catégories RH
                        var rhCategories = new[] { "Demande de congés", "Demande de formation", "Question sur le planning", "Problème de pointage", "Demande de changement d'équipe", "Question sur les avantages" };
                        
                        if (itCategories.Contains(request.Category))
                        {
                            request.AssignedTo = "IT support";
                        }
                        else if (rhCategories.Contains(request.Category))
                        {
                            request.AssignedTo = "RH";
                        }
                        else
                        {
                            // Par défaut, assigner à IT support
                            request.AssignedTo = "IT support";
                        }
                    }
                }
            }
            
            var id = await ticketService.CreateTicketAsync(request);

            if (id == 0)
                return Results.BadRequest("Failed to create a new ticket.");

            return Results.Ok(id);
        }

        public static async Task<IResult> HandleGetMyTickets(
    TicketService ticketService,
    UserService userService,
    HttpContext context)
        {
            var authenticatedUser = context.Items["User"] as Supabase.Gotrue.User;

            if (authenticatedUser == null || string.IsNullOrEmpty(authenticatedUser?.Email))
                return Results.Unauthorized();

            var connectedUser = await userService.GetUserByEmailAsync(authenticatedUser.Email);

            if (connectedUser == null)
                return Results.Unauthorized();

            string assignedTo = connectedUser.RoleId switch
            {
                2 => "IT support", // Admin
                3 => "RH", // HR
            };

            var tickets = await ticketService.GetTicketsByAssignedToAsync(assignedTo);

            if (!tickets.Any())
                return Results.NotFound("No tickets found.");

            return Results.Ok(tickets);
        }
    }
}

