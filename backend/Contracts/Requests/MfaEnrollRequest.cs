using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests
{
    [JsonSerializable(typeof(MfaEnrollRequest))]
    public class MfaEnrollRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }

        public MfaEnrollRequest()
        {
            Email = string.Empty;
            Password = string.Empty;
        }
    }
}