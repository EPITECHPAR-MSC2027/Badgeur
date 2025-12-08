using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests
{
    [JsonSerializable(typeof(LoginRequest))]
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }

        public LoginRequest() { }
    }
}