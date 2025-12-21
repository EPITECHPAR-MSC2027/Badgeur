namespace badgeur_backend.Contracts.Responses
{
    public class MfaEnrollResponse
    {
        public string FactorId { get; set; } = string.Empty;
        public string QrCode { get; set; } = string.Empty;
        public string Secret { get; set; } = string.Empty;
        public string Uri { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
    }
}