using badgeur_backend.Contracts.Requests;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class BadgeLogEventService
    {
        private readonly Client _client;

        public BadgeLogEventService(Client client)
        {
            _client = client;
        }

        public async Task<long> CreateBadgeLogEventAsync(CreateBadgeLogEventRequest request)
        {
            var badgeLogEvent = new BadgeLogEvent
            {
                BadgedAt = request.BadgedAt,
                UserId = request.UserId
            };

            var response = await _client.From<BadgeLogEvent>().Insert(badgeLogEvent);

            return response.Models.First().Id;
        }

        public async Task<List<BadgeLogEventResponse>> GetAllBadgeLogEventsAsync()
        {
            var response = await _client.From<BadgeLogEvent>().Get();


            return response.Models.Select(ble => createBadgeLogEventResponse(ble)).ToList();

        }

        public async Task<BadgeLogEventResponse?> GetBadgeLogEventByIdAsync(long id)
        {
            var response = await _client.From<BadgeLogEvent>().Where(n => n.Id == id).Get();
            var badgeLogEvent = response.Models.FirstOrDefault();

            if (badgeLogEvent == null) return null;

            return createBadgeLogEventResponse(badgeLogEvent);
        }

        public async Task DeleteBadgeLogEventAsync(long id)
        {
            await _client.From<BadgeLogEvent>().Where(n => n.Id == id).Delete();
        }

        public BadgeLogEventResponse createBadgeLogEventResponse(BadgeLogEvent badgeLogEvent)
        {
            return new BadgeLogEventResponse
            {
                BadgedAt = badgeLogEvent.BadgedAt,
                UserId = badgeLogEvent.UserId
            };
        }
    }
}