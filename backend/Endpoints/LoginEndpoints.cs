using badgeur_backend.Contracts.Requests;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Services;
using Supabase;

namespace badgeur_backend.Endpoints
{
    public static class LoginEndpoints
    {
        public static void MapLoginEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/login");

            group.MapPost("/", async (LoginRequest request, Client client, UserService userService) =>
            {
                var session = await client.Auth.SignInWithPassword(request.Email, request.Password);

                if (session == null || string.IsNullOrEmpty(session.AccessToken))
                {
                    return Results.Unauthorized();
                }


                UserResponse? user = await userService.GetUserByEmailAsync(session.User.Email);

                var response = new LoginResponse
                {
                    AccessToken = session.AccessToken,
                    RefreshToken = session.RefreshToken,
                    UserId = user.Id,
                    RoleId = user.RoleId,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = session.User?.Email
                };

                return Results.Ok(response);
            }).WithDescription("Login with a username and password combination. Returns an access token, a refresh token, and the user's email.");

        }

    }
}
