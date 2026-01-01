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

            group.MapGet("/my", async (TicketService ticketService, UserService userService, RoleService roleService, HttpContext context) =>
            {
                return await HandleGetMyTickets(ticketService, userService, roleService, context);
            }).WithDescription("Retrieve tickets assigned to the authenticated user based on their role (Admin: IT support, RH: RH).");

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
            RoleService roleService,
            HttpContext context)
        {
            // Récupérer l'utilisateur connecté depuis le middleware
            var authenticatedUser = context.Items["User"] as Supabase.Gotrue.User;
            if (authenticatedUser == null)
            {
                return Results.Unauthorized();
            }

            var userEmail = authenticatedUser.Email?.Trim() ?? "";
            if (string.IsNullOrEmpty(userEmail))
            {
                return Results.Unauthorized();
            }

            // Récupérer les informations de l'utilisateur connecté depuis la base de données
            var connectedUser = await userService.GetUserByEmailAsync(userEmail);

            if (connectedUser == null)
            {
                // L'utilisateur n'existe pas dans la table users
                // Retourner une erreur 403 avec un message explicite
                return Results.Json(
                    new { error = $"L'utilisateur avec l'email {userEmail} n'existe pas dans la base de données. Veuillez contacter l'administrateur." },
                    statusCode: 403
                );
            }

            // Récupérer le rôle pour vérifier le nom du rôle
            var role = await roleService.GetRoleByIdAsync(connectedUser.RoleId);
            var roleName = role?.RoleName?.ToLower() ?? "";

            // Déterminer le assigned_to selon le role_id ou le nom du rôle
            string assignedTo;
            
            // Vérifier d'abord par RoleId (plus fiable et rapide)
            if (connectedUser.RoleId == 2) // Admin
            {
                assignedTo = "IT support";
            }
            else if (connectedUser.RoleId == 3) // RH
            {
                assignedTo = "RH";
            }
            // Sinon vérifier par nom de rôle (pour compatibilité)
            else if (roleName.Contains("admin") || roleName.Contains("administrateur"))
            {
                assignedTo = "IT support";
            }
            else if (roleName.Contains("rh") || roleName.Contains("ressources humaines"))
            {
                assignedTo = "RH";
            }
            else
            {
                // Si l'utilisateur n'est ni Admin ni RH, retourner une erreur
                return Results.Json(
                    new { error = $"L'utilisateur avec le RoleId {connectedUser.RoleId} (nom: {role?.RoleName ?? "inconnu"}) n'a pas accès aux tickets. Seuls les administrateurs (RoleId 2) et les RH (RoleId 3) peuvent accéder à cette ressource." },
                    statusCode: 403
                );
            }

            var tickets = await ticketService.GetTicketsByAssignedToAsync(assignedTo);

            return Results.Ok(tickets);
        }
    }
}

