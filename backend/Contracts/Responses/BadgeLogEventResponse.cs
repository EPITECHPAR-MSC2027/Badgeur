namespace badgeur_backend.Contracts.Responses
{
    public class BadgeLogEventResponse
    {
        public long Id { get; set; }
        public required DateTime BadgedAt { get; set; }

        public required long UserId { get; set; }

    }
}
