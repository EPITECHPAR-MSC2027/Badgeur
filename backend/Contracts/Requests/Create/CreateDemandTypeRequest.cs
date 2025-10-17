using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Create
{
    [JsonSerializable(typeof(CreateDemandTypeRequest))]
    public class CreateDemandTypeRequest
    {
        public string Nom { get; set; } = string.Empty;
    }
}


