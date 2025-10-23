using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
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
                BadgedAt = DateTime.SpecifyKind(request.BadgedAt, DateTimeKind.Utc),
                UserId = request.UserId
            };

            var response = await _client.From<BadgeLogEvent>().Insert(badgeLogEvent);

            return response.Models.First().Id;
        }

        public async Task<List<BadgeLogEventResponse>> GetAllBadgeLogEventsAsync()
        {
            var response = await _client.From<BadgeLogEvent>().Get();

            return response.Models.Select(ble => CreateBadgeLogEventResponse(ble)).ToList();
        }

        public async Task<BadgeLogEventResponse?> GetBadgeLogEventByIdAsync(long id)
        {
            var response = await _client.From<BadgeLogEvent>().Where(n => n.Id == id).Get();
            var badgeLogEvent = response.Models.FirstOrDefault();

            if (badgeLogEvent == null) return null;

            return CreateBadgeLogEventResponse(badgeLogEvent);
        }

        public async Task<List<BadgeLogEventResponse>> GetBadgeLogEventsByUserIdAsync(long userId)
        {
            var response = await _client.From<BadgeLogEvent>().Where(n => n.UserId == userId).Get();

            return response.Models.Select(ble => CreateBadgeLogEventResponse(ble)).ToList();
        }

        public async Task DeleteBadgeLogEventAsync(long id)
        {
            await _client.From<BadgeLogEvent>().Where(n => n.Id == id).Delete();
        }

        public async Task<BadgeLogEventResponse> UpdateBadgeLogEventAsync(long id, UpdateBadgeLogEventRequest updateBadgeLogEventRequest)
        {
            var request = await _client.From<BadgeLogEvent>().Where(n => n.Id == id).Get();
            var ble = request.Models.FirstOrDefault();

            if (ble == null) return null;

            // Update the badge log event retrieved from the database with the new desired information
            ble.BadgedAt = updateBadgeLogEventRequest.BadgedAt;
            ble.UserId = updateBadgeLogEventRequest.UserId;

            request = await _client.From<BadgeLogEvent>().Update(ble);

            return CreateBadgeLogEventResponse(ble);
        }

        public async Task<UserSummaryResponse> GetUserSummaryAsync(long id)
        {
            DateTime cutoffDate = DateTime.UtcNow.Date.AddDays(-7);

            List<BadgeLogEventResponse> listOfBadgeLogEvents = await GetBadgeLogEventsByUserIdAsync(id);

            List<DateTimeOffset> arrivalTimes = listOfBadgeLogEvents
                .Where(e => e.BadgedAt.Date >= cutoffDate)
                .GroupBy(e => e.BadgedAt.Date)
                .Select(g => g.Min(e => e.BadgedAt))
                .OrderBy(d => d)
                .Select(d => new DateTimeOffset(d, TimeSpan.Zero))
                .ToList();

            List<DateTimeOffset> departureTimes = listOfBadgeLogEvents
                .Where(e => e.BadgedAt.Date >= cutoffDate)
                .GroupBy(e => e.BadgedAt.Date)
                .Select(g => g.Max(e => e.BadgedAt))
                .OrderBy(d => d)
                .Select(d => new DateTimeOffset(d, TimeSpan.Zero))
                .ToList();

            return new UserSummaryResponse
            {
                UserId = id,
                Days = arrivalTimes
                    .Zip(departureTimes, (arrival, departure) =>
                        new UserDayInterval { Arrival = arrival, Departure = departure })
                    .ToList()
            };
        }

        public BadgeLogEventResponse CreateBadgeLogEventResponse(BadgeLogEvent badgeLogEvent)
        {
            return new BadgeLogEventResponse
            {
                Id = badgeLogEvent.Id,
                BadgedAt = badgeLogEvent.BadgedAt,
                UserId = badgeLogEvent.UserId
            };
        }
    }
}