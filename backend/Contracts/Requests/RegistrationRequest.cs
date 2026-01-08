using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests
{
    public class RegistrationRequest
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string Telephone { get; set; }
        public required string Password { get; set; }
    }
}
