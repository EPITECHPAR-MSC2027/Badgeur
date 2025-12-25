namespace badgeur_backend.Contracts.Responses
{
    public class NotificationResponse
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public long? RelatedId { get; set; }
    }
}

