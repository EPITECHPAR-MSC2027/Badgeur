using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Update
{
    [JsonSerializable(typeof(UpdateDemandTypeRequest))]
    public class UpdateDemandTypeRequest
    {
        public string Nom { get; set; } = string.Empty;
    }
}


