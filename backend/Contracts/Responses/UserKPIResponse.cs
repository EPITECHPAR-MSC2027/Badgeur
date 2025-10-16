namespace badgeur_backend.Models
{
    public class UserKPIResponse
    {
        public required long Id { get; set; }

        public long UserId { get; set; }

        // 7-day rolling averages (computed on-the-fly, not persisted)
        public DateTimeOffset Raat7 { get; set; }

        public DateTimeOffset Radt7 { get; set; }

        public string Raw7 { get; set; } = default!;

        public DateTimeOffset Raat14 { get; set; }

        public DateTimeOffset Raat28 { get; set; }

        public DateTimeOffset Radt14 { get; set; }

        public DateTimeOffset Radt28 { get; set; }

        public string Raw14 { get; set; } = default!;

        public string Raw28 { get; set; } = default!;
    }
}
