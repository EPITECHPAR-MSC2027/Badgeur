namespace badgeur_backend.Contracts.Responses
{
    public class PlanningResponse
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public System.DateTime Date { get; set; }
        public string Period { get; set; } = string.Empty;
        public string Statut { get; set; } = string.Empty;
        public System.DateTime CreatedAt { get; set; }
        public long TypeDemandeId { get; set; }
    }
}


