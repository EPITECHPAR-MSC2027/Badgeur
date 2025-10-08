using badgeur_backend.Contracts.Requests;
using badgeur_backend.Contracts.Responses;
using Supabase.Gotrue;
using Client = Supabase.Client;

namespace badgeur_backend.Endpoints
{
    public static class RegistrationEndpoints
    {
        public static void MapRegistrationEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/register");

            group.MapPost("/", async (RegistrationRequest request, Client client) =>
            {
                var options = new SignUpOptions
                {
                    Data = new Dictionary<string, object>
                    {
                        { "first_name", request.FirstName },
                        { "last_name", request.LastName }
                    }
                };

                var session = await client.Auth.SignUp(Constants.SignUpType.Email, request.Email, request.Password, options);

                if (session == null || string.IsNullOrEmpty(session.AccessToken))
                {
                    return Results.BadRequest("Registration failed.");
                }

                var response = new RegistrationResponse
                {
                    AccessToken = session.AccessToken,
                    RefreshToken = session.RefreshToken,
                    Email = session.User?.Email
                };

                return Results.Ok(response);
            });

        }
    }
}
