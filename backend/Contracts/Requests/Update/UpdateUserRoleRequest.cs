using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Update
{

    public class UpdateUserRoleRequest
    {
        public required long NewRoleId { get; set; }
    }
}
