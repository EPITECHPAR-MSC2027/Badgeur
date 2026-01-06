using badgeur_backend.Contracts.Requests;
using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Services;
using badgeur_backend.Services.Auth;

namespace badgeur_backend.Endpoints
{
    public static class RegistrationEndpoints
    {
        public static void MapRegistrationEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/register");

            group.MapPost("/", async (RegistrationRequest registrationRequest, IAuthRegistration authRegistration, UserService userService) =>
            {
                return await HandleRegistration(registrationRequest, authRegistration, userService);
            }).WithDescription("Register a new user. Returns an access token, a refresh token, and the new user's information.");
        }

        public static async Task<IResult> HandleRegistration(
            RegistrationRequest registrationRequest,
            IAuthRegistration authRegistration,
            UserService userService)
        {
            Supabase.Gotrue.Session? session;
            try
            {
                session = await authRegistration.SignUp(
                    registrationRequest.Email,
                    registrationRequest.Password,
                    registrationRequest.FirstName,
                    registrationRequest.LastName);
            }
            catch
            {
                return Results.BadRequest("Registration failed. (Auth)");
            }

            if (session == null || string.IsNullOrEmpty(session.AccessToken))
            {
                return Results.BadRequest("Registration failed. (Auth)");
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

            if (id == 0)
                return Results.BadRequest("Registration failed. (Role)");

            var userResponse = await userService.GetUserByIdAsync(id);

            if (userResponse == null)
                return Results.BadRequest("Registration failed. (User retrieval)");

            var registrationResponse = new RegistrationResponse
            {
                AccessToken = session.AccessToken,
                RefreshToken = session.RefreshToken ?? string.Empty,
                UserId = userResponse.Id,
                RoleId = userResponse.RoleId,
                FirstName = userResponse.FirstName,
                LastName = userResponse.LastName
            };

            return Results.Ok(registrationResponse);
        }
    }
}