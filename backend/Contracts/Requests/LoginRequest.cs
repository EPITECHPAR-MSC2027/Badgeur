using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests
{
    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }

        public LoginRequest() { }
    }
}