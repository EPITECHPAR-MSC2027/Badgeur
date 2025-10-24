using badgeur_backend.Contracts.Requests;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Services;
using badgeur_backend.Services.Auth;

namespace badgeur_backend.Endpoints
{
    public static class LoginEndpoints
    {
        public static void MapLoginEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/login");

            group.MapPost("/", async (LoginRequest request, IAuthProvider authProvider, IUserLookup userLookup) =>
            {
                return await HandleLogin(request, authProvider, userLookup);
            }).WithDescription("Login with a username and password combination. Returns an access token, a refresh token, and the user's email.");

        }

        public static async Task<IResult> HandleLogin(LoginRequest request, IAuthProvider authProvider, IUserLookup userLookup)
        {
            var session = await authProvider.SignInWithPassword(request.Email, request.Password);

            if (session == null || string.IsNullOrEmpty(session.AccessToken))
            {
                return Results.Unauthorized();
            }

            UserResponse? user = await userLookup.GetUserByEmailAsync(session.Email);

            if (user == null)
            {
                return Results.Unauthorized();
            }

            var response = new LoginResponse
            {
                AccessToken = session.AccessToken,
                RefreshToken = session.RefreshToken,
                UserId = user.Id,
                RoleId = user.RoleId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = session.Email
            };

            return Results.Ok(response);
        }

    }
}
