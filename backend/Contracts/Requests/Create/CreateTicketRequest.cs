namespace badgeur_backend.Contracts.Requests.Create
{
    public class CreateTicketRequest
    {
        public string AssignedTo { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string UserLastName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}

