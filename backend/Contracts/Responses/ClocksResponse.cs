using System;

namespace badgeur_backend.Contracts.Responses
{
    public class ClocksResponse
    {
        public long Id { get; set; }

        public long UserId { get; set; }

        public DateTime Date { get; set; } // Only the date, no time

        public DateTimeOffset TimeArrivedAt { get; set; }

        public DateTimeOffset TimeDepartedAt { get; set; }
    }
}


