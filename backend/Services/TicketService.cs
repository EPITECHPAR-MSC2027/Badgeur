using badgeur_backend.Contracts.Requests.Create;
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

        public async Task<List<Ticket>> GetAllTicketsAsync()
        {
            var response = await _client.From<Ticket>()
                .Order(n => n.CreatedAt, Supabase.Postgrest.Constants.Ordering.Descending)
                .Get();

            return response.Models;
        }

        public async Task<Ticket?> GetTicketByIdAsync(long id)
        {
            var response = await _client.From<Ticket>().Where(t => t.Id == id).Get();
            return response.Models.FirstOrDefault();
        }
    }
}

