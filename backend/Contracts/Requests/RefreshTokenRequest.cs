using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests
{
    [JsonSerializable(typeof(RefreshTokenRequest))]
    public class RefreshTokenRequest
    {
        public required string RefreshToken { get; set; }
    }
}
