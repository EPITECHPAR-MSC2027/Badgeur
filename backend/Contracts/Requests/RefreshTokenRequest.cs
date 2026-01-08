using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests
{
    public class RefreshTokenRequest
    {
        public required string RefreshToken { get; set; }
    }
}
