using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Services
{
    public class UserKPIService
    {
        private BadgeLogEventService _badgeLogEventService;
        private Client _client;

        // Allows us to calculate the two different variants of each KPI
        public enum Period
        {
            TWO_WEEKS = 14,
            FOUR_WEEKS = 28
        };

        public UserKPIService(BadgeLogEventService badgeLogEventService, Client client)
        {
            _badgeLogEventService = badgeLogEventService;
            _client = client;
        }

        // Function that calculates the KPIs RAAT14 or RAAT28
        public async Task<DateTimeOffset> CalculateRollingAverageArrivalTime(long userId, Period period)
        {
            return await CalculateRollingAverageTime(userId, period, true);
        }

        // Function that calculates the KPIs RADT14 or RADT28 
        public async Task<DateTimeOffset> CalculateRollingAverageDepartureTime(long userId, Period period)
        {
            return await CalculateRollingAverageTime(userId, period, false);
        }

        public async Task<DateTimeOffset> CalculateRollingAverageTime(long userId, Period period, bool isArrival)
        {
            DateTime cutoffDate = DateTime.UtcNow.Date.AddDays(-(int)period - 1);

            List<BadgeLogEventResponse> listOfBadgeLogEvents = await _badgeLogEventService.GetBadgeLogEventsByUserIdAsync(userId);

            List<DateTimeOffset> groupedTimes = listOfBadgeLogEvents
                .Where(e => e.BadgedAt.Date >= cutoffDate)
                .GroupBy(e => e.BadgedAt.Date)
                .Select(g => isArrival
                ? g.Min(e => e.BadgedAt)
                : g.Max(e => e.BadgedAt))
                .OrderBy(d => d)
                .Select(d => new DateTimeOffset(d, TimeSpan.Zero))
                .ToList();

            if (groupedTimes.Count < (int)period)
            {
                string type = isArrival ? "arrival" : "departure";
                string kpi = isArrival ? "RAAT" : "RADT";
                throw new InvalidOperationException($"Less than {(int)period} {type} times found, unable to calcuate {kpi}{(int)period} KPI");
            }

            var groupedTimesSpans = groupedTimes.Select(dt => dt.TimeOfDay);

            long avgTicks = (long)groupedTimesSpans.Average(ts => ts.Ticks);

            TimeSpan avgTimeOfDay = new TimeSpan(avgTicks);

            return new DateTimeOffset(DateTime.UtcNow.Date + avgTimeOfDay, TimeSpan.Zero);
        }

        // Function that calculates the KPIs RAW14 or RAW28
        public async Task<string> CalculateRollingAverageWorkingHours(long userId, Period period)
        {
            DateTime cutoffDate = DateTime.UtcNow.Date.AddDays(-(int)period - 1);

            // Calculating the RAW KPI this way provides more or less the same result while keeping the code more readable with less duplication
            DateTimeOffset rollingAverageArrivalTime = await CalculateRollingAverageArrivalTime(userId, period);
            DateTimeOffset rollingAverageDepartureTime = await CalculateRollingAverageDepartureTime(userId, period);

            TimeSpan rollingAverageWorkingHours = rollingAverageDepartureTime.Subtract(rollingAverageArrivalTime);

            return new DateTime(rollingAverageWorkingHours.Ticks).ToString("HH:mm");
        }

        // Calculate and store User KPIs. Return the values upon success
        public async Task<UserKPIResponse> CalculateAllUserKPIs(long userId)
        {
            UserKPI userKPIs = new UserKPI
            {
                UserId = userId,
                Raat14 = await CalculateRollingAverageArrivalTime(userId, Period.TWO_WEEKS),
                Raat28 = await CalculateRollingAverageArrivalTime(userId, Period.FOUR_WEEKS),
                Radt14 = await CalculateRollingAverageDepartureTime(userId, Period.TWO_WEEKS),
                Radt28 = await CalculateRollingAverageDepartureTime(userId, Period.FOUR_WEEKS),
                Raw14 = await CalculateRollingAverageWorkingHours(userId, Period.TWO_WEEKS),
                Raw28 = await CalculateRollingAverageWorkingHours(userId, Period.FOUR_WEEKS)
            };

            //var response = await _client.From<User>().Where(n => n.Id == id).Get();
            //var user = response.Models.FirstOrDefault();

            //if (user == null) return null;

            // Step 1: Check if there is a database entry for the user's KPIs
            // Step 2: If yes -> Update entry and return the response
            //         If no  -> Create an entry and return the response
            //
            //var response = await _client.From<UserKPI>().Insert(userKPIs);

            var response = await _client.From<UserKPI>.Where(n => n.UserId == userId).Get();
            var userKPI = response.Models.FirstOrDefault();

            if (userKPI == null)
            {
                response = await _client.From<UserKPI>().Insert(userKPIs);
                userKPI = response.Models.FirstOrDefault();
            }

            return userKPI;
        }


    }
}
