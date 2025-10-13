namespace badgeur_backend.Models
{
    public class UserKPIResponse
    {
        public required long Id { get; set; }

        public long UserId { get; set; }

        public DateTimeOffset Raat14 { get; set; }

        public DateTimeOffset Raat28 { get; set; }

        public DateTimeOffset Radt14 { get; set; }

        public DateTimeOffset Radt28 { get; set; }

        public string Raw14 { get; set; } = default!;

        public string Raw28 { get; set; } = default!;
    }
}
