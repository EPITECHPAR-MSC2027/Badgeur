using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Create
{
    public class CreateDemandTypeRequest
    {
        public string Nom { get; set; } = string.Empty;
    }
}


