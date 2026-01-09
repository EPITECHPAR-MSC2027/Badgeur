using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Update
{

    public class UpdateUserRequest
    {
        public required string FirstName { get; set; }

        public required string LastName { get; set; }

        public required string Telephone { get; set; }

        public long RoleId { get; set; }

        public long? TeamId { get; set; }
    }
}
