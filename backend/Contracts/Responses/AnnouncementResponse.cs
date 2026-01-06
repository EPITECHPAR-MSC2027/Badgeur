namespace badgeur_backend.Contracts.Responses
{
    public class AnnouncementResponse
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public long AuthorId { get; set; }
        public string AuthorFirstName { get; set; } = string.Empty;
        public string AuthorLastName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}

