namespace badgeur_backend.Contracts.Responses
{
    public class TeamResponse
    {        
        public required long Id { get; set; }
        public required string TeamName { get; set; }
        public required long ManagerId { get; set; }

    }
}
