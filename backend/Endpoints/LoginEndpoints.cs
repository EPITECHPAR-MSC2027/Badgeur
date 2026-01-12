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

            group.MapPost("/mfa-login", async (MfaLoginRequest request, IAuthProvider authProvider, IUserLookup userLookup) =>
            {
                return await HandleMfaLogin(request, authProvider, userLookup);
            }).WithDescription("Complete MFA login with a TOTP code.");

            group.MapPost("/mfa-setup", async (MfaEnrollRequest request, IAuthProvider authProvider) =>
            {
                return await HandleMfaEnroll(request, authProvider);
            }).WithDescription("Enroll in MFA/TOTP. Returns QR code and secret for authenticator app setup.");

            group.MapPost("/mfa-verify", async (MfaVerifyRequest request, IAuthProvider authProvider) =>
            {
                return await HandleMfaVerify(request, authProvider);
            }).WithDescription("Verify MFA enrollment with a TOTP code from authenticator app.");

            group.MapGet("/mfa-status", async (HttpContext context, IAuthProvider authProvider) =>
            {
                return await HandleMfaStatus(context, authProvider);
            }).WithDescription("Check if the current user has MFA enabled.");
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

            // Check if user has MFA enabled
            var factors = await authProvider.ListMfaFactors(session.AccessToken, session.RefreshToken);
            var verifiedFactor = factors.FirstOrDefault(f => f.Status == "verified");

            if (verifiedFactor != null)
            {
                // MFA is required - create a challenge
                var challenge = await authProvider.ChallengeMfa(verifiedFactor.Id, session.AccessToken, session.RefreshToken);

                if (challenge == null)
                {
                    return Results.BadRequest("Failed to create MFA challenge");
                }

                return Results.Ok(new LoginResponse
                {
                    AccessToken = session.AccessToken,
                    RefreshToken = session.RefreshToken,
                    UserId = user.Id,
                    RoleId = user.RoleId,
                    TeamId = user.TeamId,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = session.Email,
                    MfaRequired = true,
                    FactorId = verifiedFactor.Id,
                    ChallengeId = challenge.AccessToken
                });
            }

            var response = new LoginResponse
            {
                AccessToken = session.AccessToken,
                RefreshToken = session.RefreshToken,
                UserId = user.Id,
                RoleId = user.RoleId,
                TeamId = user.TeamId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = session.Email,
                MfaRequired = false
            };

            return Results.Ok(response);
        }

        public static async Task<IResult> HandleMfaLogin(MfaLoginRequest request, IAuthProvider authProvider, IUserLookup userLookup)
        {
            try
            {
                var verifyResponse = await authProvider.VerifyMfaChallenge(
                    request.FactorId,
                    request.ChallengeId,
                    request.Code,
                    request.AccessToken,
                    request.RefreshToken);

                if (verifyResponse == null)
                {
                    return Results.BadRequest("Invalid MFA code");
                }

                var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var token = handler.ReadJwtToken(request.AccessToken);
                var email = token.Claims.FirstOrDefault(c => c.Type == "email")?.Value;

                if (string.IsNullOrEmpty(email))
                {
                    return Results.Unauthorized();
                }

                var user = await userLookup.GetUserByEmailAsync(email);

                if (user == null)
                {
                    return Results.Unauthorized();
                }

                return Results.Ok(new LoginResponse
                {
                    AccessToken = verifyResponse.AccessToken,
                    RefreshToken = verifyResponse.RefreshToken,
                    UserId = user.Id,
                    RoleId = user.RoleId,
                    TeamId = user.TeamId,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    MfaRequired = false
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"HandleMfaLogin error: {ex.Message}");
                return Results.BadRequest($"MFA login failed: {ex.Message}");
            }
        }

        public static async Task<IResult> HandleMfaEnroll(MfaEnrollRequest request, IAuthProvider authProvider)
        {
            try
            {
                var session = await authProvider.SignInWithPassword(request.Email, request.Password);

                if (session == null || string.IsNullOrEmpty(session.AccessToken))
                {
                    return Results.Unauthorized();
                }

                var enrollResponse = await authProvider.EnrollMfa(session.AccessToken, session.RefreshToken);

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
                    AccessToken = session.AccessToken,
                    RefreshToken = session.RefreshToken
                };

                return Results.Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"HandleMfaEnroll validation error: {ex.Message}");
                return Results.Conflict(ex.Message);
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
                var verifyResponse = await authProvider.VerifyMfaEnrollment(
                    request.FactorId,
                    request.Code,
                    request.AccessToken,
                    request.RefreshToken);

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

        public static async Task<IResult> HandleMfaStatus(HttpContext context, IAuthProvider authProvider)
        {
            try
            {
                var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    return Results.Unauthorized();
                }

                var accessToken = authHeader.Substring("Bearer ".Length);
                var refreshToken = context.Request.Headers["X-Refresh-Token"].FirstOrDefault() ?? string.Empty;

                var factors = await authProvider.ListMfaFactors(accessToken, refreshToken);
                var verifiedFactor = factors.FirstOrDefault(f => f.Status == "verified");

                return Results.Ok(new
                {
                    mfaEnabled = verifiedFactor != null,
                    factorId = verifiedFactor?.Id
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"HandleMfaStatus error: {ex.Message}");
                return Results.Ok(new { mfaEnabled = false });
            }
        }
    }
}