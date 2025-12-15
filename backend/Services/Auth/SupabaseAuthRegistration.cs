using Supabase.Gotrue;
using Client = Supabase.Client;

namespace badgeur_backend.Services.Auth
{
    public class SupabaseAuthRegistration : IAuthRegistration
    {
        private readonly Client _client;

        public SupabaseAuthRegistration(Client client)
        {
            _client = client;
        }

        public async Task<Session?> SignUp(string email, string password, string firstName, string lastName)
        {
            var options = new SignUpOptions
            {
                Data = new Dictionary<string, object>
                {
                    { "first_name", firstName },
                    { "last_name", lastName },
                }
            };

            return await _client.Auth.SignUp(Constants.SignUpType.Email, email, password, options);
        }
    }
}