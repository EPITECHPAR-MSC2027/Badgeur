using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests
{

    [JsonSerializable(typeof(CreateUserRequest))]
    public class CreateUserRequest
    {
        public required string FirstName { get; set; }

        public required string LastName { get; set; }

        public long RoleId { get; set; }

        public long TeamId { get; set; }
    }
}
