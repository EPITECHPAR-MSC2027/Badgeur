using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Create
{
    public class CreateRoleRequest
    {        
        public required string RoleName { get; set; }

    }
}
