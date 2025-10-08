using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests
{

    [JsonSerializable(typeof(LoginRequest))]
    public class LoginRequest
    {
        public required string email { get; set; }

        public required string password { get; set; }
    }
}
