using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests
{
    [JsonSerializable(typeof(RegistrationRequest))]
    public class RegistrationRequest
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }

        // Team ID can be null while Role ID has a default value of 0 - Employee that is set by the DB itself
    }
}
