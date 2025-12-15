using Supabase.Gotrue;
using System.Threading.Tasks;

namespace badgeur_backend.Services.Auth
{
    public interface IAuthRegistration
    {
        Task<Session?> SignUp(string email, string password, string firstName, string lastName);
    }
}