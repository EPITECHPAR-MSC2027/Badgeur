namespace badgeur_backend.Contracts.Requests
{
    public class CreatePlanningRequest
    {
        public long UserId { get; set; }
        public DateTime Date { get; set; }
        public string Period { get; set; } = string.Empty;
        public string Statut { get; set; } = string.Empty;
        public long TypeDemandeId { get; set; }
    }
}


