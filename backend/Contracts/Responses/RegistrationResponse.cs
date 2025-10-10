namespace badgeur_backend.Contracts.Responses
{
    public class RegistrationResponse
    {
        public required string AccessToken { get; set; }

        public string? RefreshToken { get; set; }

        public long? UserId { get; set; }

        public long? RoleId { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string? Email { get; set; }

    }
}
