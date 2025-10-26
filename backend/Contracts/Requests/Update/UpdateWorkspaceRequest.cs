using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Update
{
    [JsonSerializable(typeof(UpdateWorkspaceRequest))]
    public class UpdateWorkspaceRequest
    {
        public int Number { get; set; } = default!;
        public long IdFloor { get; set; } = default!;
    }
}

