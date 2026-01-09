using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;
using Client = Supabase.Client;

namespace badgeur_backend.Services
{
    public class TicketService
    {
        private readonly Client _client;

        public TicketService(Client client)
        {
            _client = client;
        }

        public async Task<long> CreateTicketAsync(CreateTicketRequest request)
        {
            var ticket = new Ticket
            {
                AssignedTo = request.AssignedTo,
                UserName = request.UserName,
                UserLastName = request.UserLastName,
                UserEmail = request.UserEmail,
                Category = request.Category,
                Description = request.Description,
                Status = "à traiter",
                CreatedAt = DateTime.UtcNow
            };

            var response = await _client.From<Ticket>().Insert(ticket);
            return response.Models.First().Id;
        }

        public async Task<List<TicketResponse>> GetAllTicketsAsync()
        {
            var response = await _client.From<Ticket>()
                .Order(n => n.CreatedAt, Supabase.Postgrest.Constants.Ordering.Descending)
                .Get();

            return response.Models.Select(t => CreateTicketResponse(t)).ToList();
        }

        public async Task<List<TicketResponse>> GetAllTicketsByEmailAsync(string email)
        {
            var response = await _client.From<Ticket>()
                .Where(t => t.UserEmail == email)
                .Order(n => n.CreatedAt, Supabase.Postgrest.Constants.Ordering.Descending)
                .Get();

            return response.Models.Select(t => CreateTicketResponse(t)).ToList();
        }

        public async Task<List<TicketResponse>> GetAllTicketsByAssignedToAsync(string assignedTo)
        {
            var response = await _client.From<Ticket>()
                .Where(t => t.AssignedTo == assignedTo)
                .Order(n => n.CreatedAt, Supabase.Postgrest.Constants.Ordering.Descending)
                .Get();

            return response.Models.Select(t => CreateTicketResponse(t)).ToList();
        }

        public async Task<TicketResponse?> GetTicketByIdAsync(long id)
        {
            var response = await _client.From<Ticket>().Where(t => t.Id == id).Get();
            var ticket = response.Models.FirstOrDefault();

            if (ticket == null) return null;

            return CreateTicketResponse(ticket);
        }

        public async Task<List<TicketResponse>> GetTicketsByAssignedToAsync(string assignedTo)
        {
            var response = await _client.From<Ticket>()
                .Where(t => t.AssignedTo == assignedTo)
                .Order(n => n.CreatedAt, Supabase.Postgrest.Constants.Ordering.Descending)
                .Get();

            return response.Models.Select(t => CreateTicketResponse(t)).ToList();
        }

        public async Task<bool> UpdateTicketStatusAsync(long id, string status)
        {
            var query = await _client.From<Ticket>().Where(t => t.Id == id).Get();
            var ticket = query.Models.FirstOrDefault();

            if (ticket == null)
                return false;

            ticket.Status = status;
            await _client.From<Ticket>().Update(ticket);

            return true;
        }

        public TicketResponse CreateTicketResponse(Ticket ticket)
        {
            return new TicketResponse
            {
                Id = ticket.Id,
                AssignedTo = ticket.AssignedTo,
                CreatedAt = ticket.CreatedAt,
                UserName = ticket.UserName,
                UserLastName = ticket.UserLastName,
                UserEmail = ticket.UserEmail,
                Category = ticket.Category,
                Description = ticket.Description,
                Status = ticket.Status
            };
        }
    }
}