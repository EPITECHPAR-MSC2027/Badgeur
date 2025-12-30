namespace badgeur_backend.Contracts.Requests.Create
{
    public class CreateAnnouncementRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public long AuthorId { get; set; }
    }
}

