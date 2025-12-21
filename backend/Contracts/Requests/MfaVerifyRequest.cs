namespace badgeur_backend.Contracts.Requests
{
    public class MfaVerifyRequest
    {
        public string FactorId { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}