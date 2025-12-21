using badgeur_backend.Contracts.Requests;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Services;
using badgeur_backend.Services.Auth;
using Microsoft.AspNetCore.Http.HttpResults;

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

            group.MapPost("/mfa-setup", async (MfaEnrollRequest request, IAuthProvider authProvider) =>
            {
                return await HandleMfaEnroll(request, authProvider);
            }).WithDescription("Enroll in MFA/TOTP. Returns QR code and secret for authenticator app setup.");

            group.MapPost("/mfa-verify", async (MfaVerifyRequest request, IAuthProvider authProvider) =>
            {
                return await HandleMfaVerify(request, authProvider);
            }).WithDescription("Verify MFA enrollment with a TOTP code from authenticator app.");
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

        public static async Task<IResult> HandleMfaEnroll(MfaEnrollRequest request, IAuthProvider authProvider)
        {
            try
            {
                // First, authenticate the user
                var session = await authProvider.SignInWithPassword(request.Email, request.Password);

                if (session == null || string.IsNullOrEmpty(session.AccessToken))
                {
                    return Results.Unauthorized();
                }

                // Enroll in MFA
                var enrollResponse = await authProvider.EnrollMfa(session.AccessToken);

                if (enrollResponse == null)
                {
                    return Results.BadRequest("Failed to enroll in MFA - enrollment returned null");
                }

                var response = new Contracts.Responses.MfaEnrollResponse
                {
                    FactorId = enrollResponse.Id,
                    QrCode = enrollResponse.QrCode,
                    Secret = enrollResponse.Secret,
                    Uri = enrollResponse.Uri,
                    AccessToken = session.AccessToken // Include the access token
                };

                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"HandleMfaEnroll error: {ex.Message}");
                return Results.BadRequest($"MFA enrollment failed: {ex.Message}");
            }
        }

        public static async Task<IResult> HandleMfaVerify(MfaVerifyRequest request, IAuthProvider authProvider)
        {
            try
            {
                // Pass the access token to restore the session
                var verifyResponse = await authProvider.VerifyMfaEnrollment(request.FactorId, request.Code, request.AccessToken);

                if (verifyResponse == null)
                {
                    return Results.BadRequest("Invalid MFA code");
                }

                return Results.Ok(new { message = "MFA enrollment verified successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"HandleMfaVerify error: {ex.Message}");
                return Results.BadRequest($"MFA verification failed: {ex.Message}");
            }
        }
    }
}