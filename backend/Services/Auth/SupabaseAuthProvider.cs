using Supabase;

namespace badgeur_backend.Services.Auth
{
    public class SupabaseAuthProvider : IAuthProvider
    {
        private readonly Client _client;

        public SupabaseAuthProvider(Client client)
        {
            _client = client;
        }

        public async Task<AuthSession?> SignInWithPassword(string email, string password)
        {
            var session = await _client.Auth.SignInWithPassword(email, password);

            if (session == null || string.IsNullOrEmpty(session.AccessToken))
            {
                return null;
            }

            var userEmail = session.User?.Email ?? string.Empty;

            return new AuthSession
            (
                AccessToken: session.AccessToken,
                RefreshToken: session.RefreshToken,
                Email: userEmail
            );
        }
    }
}
