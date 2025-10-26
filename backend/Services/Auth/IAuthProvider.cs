namespace badgeur_backend.Services.Auth
{

    public sealed record AuthSession(string AccessToken, string RefreshToken, string Email);
    public interface IAuthProvider
    {
        Task<AuthSession?> SignInWithPassword(string email, string password);
    }
}
