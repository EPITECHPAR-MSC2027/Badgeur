namespace badgeur_backend.Models
{
    public class UserKPIResponse
    {
        public required long Id { get; set; }

        public long UserId { get; set; }

        // Working hours metrics
        public string HoursPerDay { get; set; } = "00:00"; // Average hours per working day
        public string HoursPerWeek { get; set; } = "00:00"; // Average hours per week
        public int WorkingDays { get; set; } = 0; // Number of working days in the period
        public int TotalDays { get; set; } = 0; // Total days in the period
        public double PresenceRate { get; set; } = 0.0; // Working days / Total days percentage

        // Legacy fields for backward compatibility (deprecated)
        public DateTimeOffset Raat7 { get; set; }
        public DateTimeOffset Radt7 { get; set; }
        public string Raw7 { get; set; } = "00:00";
        public DateTimeOffset Raat14 { get; set; }
        public DateTimeOffset Raat28 { get; set; }
        public DateTimeOffset Radt14 { get; set; }
        public DateTimeOffset Radt28 { get; set; }
        public string Raw14 { get; set; } = "00:00";
        public string Raw28 { get; set; } = "00:00";
    }
}
