namespace badgeur_backend.Services.Auth
{

    public sealed record AuthSession(string AccessToken, string RefreshToken, string Email);

    public sealed record MfaEnrollResponse(string Id, string Type, string QrCode, string Secret, string Uri);

    public sealed record MfaVerifyResponse(string AccessToken, string RefreshToken);

    public sealed record MfaFactor(string Id, string Type, string Status, DateTime CreatedAt);

    public interface IAuthProvider
    {
        Task<AuthSession?> SignInWithPassword(string email, string password);

        // MFA
        Task<MfaEnrollResponse?> EnrollMfa(string accessToken);
        Task<MfaVerifyResponse?> VerifyMfaEnrollment(string factorId, string code, string accessToken, string refreshToken);
        Task<MfaVerifyResponse?> ChallengeMfa(string factorId);
        Task<MfaVerifyResponse?> VerifyMfaChallenge(string factorId, string challengeId, string code);
        Task<List<MfaFactor>> ListMfaFactors(string accessToken);
        Task<bool> UnenrollMfa(string factorId);
    }
}