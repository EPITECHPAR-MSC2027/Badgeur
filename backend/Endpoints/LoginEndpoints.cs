using badgeur_backend.Contracts.Requests;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Endpoints
{
    public static class LoginEndpoints
    {
        public static void MapUserEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/login");


            
        }
    }
}
