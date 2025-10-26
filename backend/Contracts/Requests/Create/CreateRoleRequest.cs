using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Create
{
    [JsonSerializable(typeof(CreateRoleRequest))]
    public class CreateRoleRequest
    {        
        public required string RoleName { get; set; }

    }
}
