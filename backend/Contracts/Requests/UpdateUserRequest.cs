using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests
{
    [JsonSerializable(typeof(UpdateUserRequest))]
    public class UpdateUserRequest
    {
        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Telephone { get; set; }

        public long RoleId { get; set; }

        public long? TeamId { get; set; }
    }
}
