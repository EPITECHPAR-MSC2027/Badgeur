using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Update
{
    [JsonSerializable(typeof(UpdatePlanningRequest))]
    public class UpdatePlanningRequest
    {
        public DateTime Date { get; set; }
        public string Period { get; set; } = string.Empty;
        public string Statut { get; set; } = string.Empty;
        public long TypeDemandeId { get; set; }
    }
}


