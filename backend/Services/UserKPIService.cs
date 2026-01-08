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
            ONE_WEEK = 7,
            TWO_WEEKS = 14,
            FOUR_WEEKS = 28
        };

        public UserKPIService(BadgeLogEventService badgeLogEventService, Client client)
        {
            _badgeLogEventService = badgeLogEventService;
            _client = client;
        }

        // Function that calculates the KPIs RAAT14 or RAAT28
        public virtual async Task<DateTimeOffset> CalculateRollingAverageArrivalTime(long userId, Period period)
        {
            return await CalculateRollingAverageTime(userId, period, true);
        }

        // Function that calculates the KPIs RADT14 or RADT28 
        public virtual async Task<DateTimeOffset> CalculateRollingAverageDepartureTime(long userId, Period period)
        {
            return await CalculateRollingAverageTime(userId, period, false);
        }

        public virtual async Task<DateTimeOffset> CalculateRollingAverageTime(long userId, Period period, bool isArrival)
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
        public virtual async Task<string> CalculateRollingAverageWorkingHours(long userId, Period period)
        {
            DateTime cutoffDate = DateTime.UtcNow.Date.AddDays(-(int)period - 1);

            List<BadgeLogEventResponse> listOfBadgeLogEvents = await _badgeLogEventService.GetBadgeLogEventsByUserIdAsync(userId);

            // Filter events within the period
            var recentEvents = listOfBadgeLogEvents
                .Where(e => e.BadgedAt.Date >= cutoffDate)
                .OrderBy(e => e.BadgedAt)
                .ToList();

            if (recentEvents.Count == 0)
            {
                return "00:00";
            }

            // Group events by day
            var dailyGroups = recentEvents
                .GroupBy(e => e.BadgedAt.Date)
                .ToList();

            double totalHours = 0;
            int workingDays = 0;

            foreach (var dayGroup in dailyGroups)
            {
                var dayEvents = dayGroup.OrderBy(e => e.BadgedAt).ToList();
                
                if (dayEvents.Count >= 2) // At least arrival and departure
                {
                    double dayHours = 0;
                    
                    if (dayEvents.Count == 2)
                    {
                        // Half day: only 2nd - 1st
                        dayHours = (dayEvents[1].BadgedAt - dayEvents[0].BadgedAt).TotalHours;
                    }
                    else if (dayEvents.Count >= 4)
                    {
                        // Full day: (2nd - 1st) + (4th - 3rd)
                        dayHours = (dayEvents[1].BadgedAt - dayEvents[0].BadgedAt).TotalHours +
                                  (dayEvents[3].BadgedAt - dayEvents[2].BadgedAt).TotalHours;
                    }
                    else if (dayEvents.Count == 3)
                    {
                        // Partial day: only (2nd - 1st)
                        dayHours = (dayEvents[1].BadgedAt - dayEvents[0].BadgedAt).TotalHours;
                    }

                    if (dayHours > 0)
                    {
                        totalHours += dayHours;
                        workingDays++;
                    }
                }
            }

            if (workingDays == 0)
            {
                return "00:00";
            }

            double averageHours = totalHours / workingDays;
            int hours = (int)averageHours;
            int minutes = (int)((averageHours - hours) * 60);

            return $"{hours:D2}:{minutes:D2}";
        }

        // Function that calculates weekly working hours
        public virtual async Task<string> CalculateWeeklyWorkingHours(long userId)
        {
            // Get events from the last 7 days
            DateTime weekStart = DateTime.UtcNow.Date.AddDays(-7);
            List<BadgeLogEventResponse> listOfBadgeLogEvents = await _badgeLogEventService.GetBadgeLogEventsByUserIdAsync(userId);

            var weekEvents = listOfBadgeLogEvents
                .Where(e => e.BadgedAt.Date >= weekStart)
                .OrderBy(e => e.BadgedAt)
                .ToList();

            if (weekEvents.Count == 0)
            {
                return "00:00";
            }

            // Group events by day
            var dailyGroups = weekEvents
                .GroupBy(e => e.BadgedAt.Date)
                .ToList();

            double totalHours = 0;
            int workingDays = 0;

            foreach (var dayGroup in dailyGroups)
            {
                var dayEvents = dayGroup.OrderBy(e => e.BadgedAt).ToList();
                
                if (dayEvents.Count >= 2)
                {
                    double dayHours = 0;
                    
                    if (dayEvents.Count == 2)
                    {
                        dayHours = (dayEvents[1].BadgedAt - dayEvents[0].BadgedAt).TotalHours;
                    }
                    else if (dayEvents.Count >= 4)
                    {
                        dayHours = (dayEvents[1].BadgedAt - dayEvents[0].BadgedAt).TotalHours +
                                  (dayEvents[3].BadgedAt - dayEvents[2].BadgedAt).TotalHours;
                    }
                    else if (dayEvents.Count == 3)
                    {
                        dayHours = (dayEvents[1].BadgedAt - dayEvents[0].BadgedAt).TotalHours;
                    }

                    if (dayHours > 0)
                    {
                        totalHours += dayHours;
                        workingDays++;
                    }
                }
            }

            if (workingDays == 0)
            {
                return "00:00";
            }

            double averageHours = totalHours / workingDays;
            int hours = (int)averageHours;
            int minutes = (int)((averageHours - hours) * 60);

            return $"{hours:D2}:{minutes:D2}";
        }

        // Calculate and store User KPIs. Return the values upon success
        public virtual async Task<UserKPI?> CalculateAllUserKPIs(long userId)
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

            var response = await _client.From<UserKPI>().Where(n => n.UserId == userId).Get();
            var existingUserKPI = response.Models.FirstOrDefault();

            if (existingUserKPI == null)
            {
                // Insert new KPI record
                response = await _client.From<UserKPI>().Insert(userKPIs);
                return response.Models.FirstOrDefault();
            }
            else
            {
                // Update existing KPI record
                userKPIs.Id = existingUserKPI.Id;
                response = await _client.From<UserKPI>().Where(n => n.Id == existingUserKPI.Id).Update(userKPIs);
                return response.Models.FirstOrDefault();
            }
        }


    }
}
