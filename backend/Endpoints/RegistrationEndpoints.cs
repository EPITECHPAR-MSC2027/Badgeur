using badgeur_backend.Contracts.Requests;
using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Services;
using Supabase.Gotrue;
using Client = Supabase.Client;

namespace badgeur_backend.Endpoints
{
    public static class RegistrationEndpoints
    {
        public static void MapRegistrationEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/register");

            group.MapPost("/", async (RegistrationRequest registrationRequest, Client client, UserService userService) =>
            {
                var options = new SignUpOptions
                {
                    Data = new Dictionary<string, object>
                    {
                        { "first_name", registrationRequest.FirstName },
                        { "last_name", registrationRequest.LastName },
                    }
                };

                var session = await client.Auth.SignUp(Constants.SignUpType.Email, registrationRequest.Email, registrationRequest.Password, options);

                if (session == null || string.IsNullOrEmpty(session.AccessToken))
                {
                    return Results.BadRequest("Registration failed. (Role)");
                }

                // Each new user has to be saved to two different databases, one for the AUTHENTICATION (auth) and another for their ROLE (public.users).
                // This may or may not be avoidable.

                CreateUserRequest createUserRequest = new CreateUserRequest
                {
                    FirstName = registrationRequest.FirstName,
                    LastName = registrationRequest.LastName,
                    Email = registrationRequest.Email,
                    Telephone = registrationRequest.Telephone
                };

                var id = await userService.CreateUserAsync(createUserRequest);

                if (id == null)
                    return Results.BadRequest("Registration failed. (Auth)");

                var userResponse = await userService.GetUserByIdAsync(id);

                var registrationResponse = new RegistrationResponse
                {
                    AccessToken = session.AccessToken,
                    RefreshToken = session.RefreshToken,
                    UserId = userResponse.Id,
                    RoleId = userResponse.RoleId,
                    FirstName = userResponse.FirstName,
                    LastName = userResponse.LastName
                };

                return Results.Ok(registrationResponse);
            }).WithDescription("Register a new user. Returns an access token, a refresh token, and the new user's email.");

        }
    }
}
