namespace badgeur_backend.Contracts.Responses
{
    public class RegistrationResponse
    {
        public required string AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public string? Email { get; set; }

    }
}
