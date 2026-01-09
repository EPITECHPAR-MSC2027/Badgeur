namespace badgeur_backend.Contracts.Responses
{
    public class LoginResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public long UserId { get; set; }
        public long RoleId { get; set; }
        public long? TeamId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // MFA fields
        public bool MfaRequired { get; set; } = false;
        public string? FactorId { get; set; }
        public string? ChallengeId { get; set; }
    }
}