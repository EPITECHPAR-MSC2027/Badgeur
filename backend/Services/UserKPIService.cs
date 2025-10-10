using badgeur_backend.Contracts.Responses;

namespace badgeur_backend.Services
{
    public class UserKPIService
    {
        private BadgeLogEventService _badgeLogEventService;

        public enum Period
        {
            TWO_WEEKS = 14,
            FOUR_WEEKS = 28
        };

        public UserKPIService(BadgeLogEventService badgeLogEventService)
        {
            _badgeLogEventService = badgeLogEventService;
        }

        // Function that calculates the KPIs RAAT14 and RAAT28 based on the input parameter
        public async Task<DateTimeOffset> CalculateRollingAverageArrivalTime(long userId, Period period)
        {
            return await CalculateRollingAverageTime(userId, period, true);
        }

        // Function that calculates the KPIs RADT14 and RADT28 based on the input parameter
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
    }
}
