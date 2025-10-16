using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests
{

    [JsonSerializable(typeof(UpdateUserRoleRequest))]
    public class UpdateUserRoleRequest
    {
        public required long NewRoleId { get; set; }
    }
}
