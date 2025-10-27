using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Create
{
    [JsonSerializable(typeof(CreateWorkspaceRequest))]
    public class CreateWorkspaceRequest
    {
        public required int Number { get; set; }
        public required long IdFloor { get; set; }
    }
}

