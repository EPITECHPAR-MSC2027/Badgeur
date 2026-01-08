using Supabase;
using Supabase.Gotrue;
using Supabase.Gotrue.Exceptions;
using Supabase.Gotrue.Mfa;

namespace badgeur_backend.Services.Auth
{
    public class SupabaseAuthProvider : IAuthProvider
    {
        private readonly Supabase.Client _client;

        public SupabaseAuthProvider(Supabase.Client client)
        {
            _client = client;
        }

        public async Task<AuthSession?> SignInWithPassword(string email, string password)
        {
            try
            {
                var session = await _client.Auth.SignInWithPassword(email, password);

                if (session == null || string.IsNullOrEmpty(session.AccessToken))
                {
                    Console.WriteLine("SignIn: Session or access token is null");
                    return null;
                }

                var userEmail = session.User?.Email ?? string.Empty;

                return new AuthSession
                (
                    AccessToken: session.AccessToken,
                    RefreshToken: session.RefreshToken ?? string.Empty,
                    Email: userEmail
                );
            }
            catch (GotrueException ex)
            {
                Console.WriteLine($"SignIn Gotrue error: {ex.Message} (StatusCode: {ex.StatusCode})");
                return null;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"SignIn network error: {ex.Message}");
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SignIn unexpected error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return null;
            }
        }

        public async Task<MfaEnrollResponse?> EnrollMfa(string accessToken)
        {
            try
            {
                var enrollResponse = await _client.Auth.Enroll(new MfaEnrollParams
                {
                    FactorType = "totp"
                });

                if (enrollResponse == null)
                {
                    Console.WriteLine("MFA Enroll: enrollResponse is null");
                    return null;
                }

                Console.WriteLine($"MFA Enroll success: FactorId={enrollResponse.Id}");

                return new MfaEnrollResponse(
                    Id: enrollResponse.Id,
                    Type: "totp",
                    QrCode: enrollResponse.Totp?.QrCode ?? string.Empty,
                    Secret: enrollResponse.Totp?.Secret ?? string.Empty,
                    Uri: enrollResponse.Totp?.Uri ?? string.Empty
                );
            }
            catch (GotrueException ex)
            {
                Console.WriteLine($"MFA Enroll Gotrue error: {ex.Message} (StatusCode: {ex.StatusCode})");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return null;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"MFA Enroll network error: {ex.Message}");
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MFA Enroll unexpected error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return null;
            }
        }

        public async Task<MfaVerifyResponse?> VerifyMfaEnrollment(string factorId, string code, string accessToken, string refreshToken)
        {
            try
            {
                await _client.Auth.SetSession(accessToken, refreshToken);

                var challenge = await _client.Auth.Challenge(new MfaChallengeParams
                {
                    FactorId = factorId
                });

                if (challenge?.Id == null)
                {
                    Console.WriteLine("MFA Verify: challenge is null or missing ID");
                    return null;
                }

                var verifyResponse = await _client.Auth.Verify(new MfaVerifyParams
                {
                    FactorId = factorId,
                    ChallengeId = challenge.Id,
                    Code = code
                });

                if (verifyResponse?.AccessToken == null)
                {
                    Console.WriteLine("MFA Verify: verifyResponse or access token is null");
                    return null;
                }

                return new MfaVerifyResponse(
                    AccessToken: verifyResponse.AccessToken,
                    RefreshToken: verifyResponse.RefreshToken ?? string.Empty
                );
            }
            catch (GotrueException ex)
            {
                Console.WriteLine($"MFA Verify Gotrue error: {ex.Message} (StatusCode: {ex.StatusCode})");
                return null;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"MFA Verify network error: {ex.Message}");
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MFA Verify unexpected error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return null;
            }
        }

        public async Task<MfaVerifyResponse?> ChallengeMfa(string factorId, string accessToken, string refreshToken)
        {
            try
            {
                await _client.Auth.SetSession(accessToken, refreshToken);

                var challenge = await _client.Auth.Challenge(new MfaChallengeParams
                {
                    FactorId = factorId
                });

                if (challenge?.Id == null)
                {
                    Console.WriteLine("MFA Challenge: challenge is null or missing ID");
                    return null;
                }

                return new MfaVerifyResponse(
                    AccessToken: challenge.Id,  // Return challenge ID here
                    RefreshToken: string.Empty
                );
            }
            catch (GotrueException ex)
            {
                Console.WriteLine($"MFA Challenge Gotrue error: {ex.Message} (StatusCode: {ex.StatusCode})");
                return null;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"MFA Challenge network error: {ex.Message}");
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MFA Challenge unexpected error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return null;
            }
        }

        public async Task<MfaVerifyResponse?> VerifyMfaChallenge(string factorId, string challengeId, string code, string accessToken, string refreshToken)
        {
            try
            {
                await _client.Auth.SetSession(accessToken, refreshToken);

                var verifyResponse = await _client.Auth.Verify(new MfaVerifyParams
                {
                    FactorId = factorId,
                    ChallengeId = challengeId,
                    Code = code
                });

                if (verifyResponse?.AccessToken == null)
                {
                    Console.WriteLine("MFA VerifyChallenge: verifyResponse or access token is null");
                    return null;
                }

                return new MfaVerifyResponse(
                    AccessToken: verifyResponse.AccessToken,
                    RefreshToken: verifyResponse.RefreshToken ?? string.Empty
                );
            }
            catch (GotrueException ex)
            {
                Console.WriteLine($"MFA VerifyChallenge Gotrue error: {ex.Message} (StatusCode: {ex.StatusCode})");
                return null;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"MFA VerifyChallenge network error: {ex.Message}");
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MFA VerifyChallenge unexpected error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return null;
            }
        }

        public async Task<List<MfaFactor>> ListMfaFactors(string accessToken, string refreshToken)
        {
            try
            {
                await _client.Auth.SetSession(accessToken, refreshToken);

                var factors = await _client.Auth.ListFactors();

                if (factors?.All == null)
                {
                    Console.WriteLine("MFA ListFactors: factors or factors.All is null");
                    return new List<MfaFactor>();
                }

                return factors.All.Select(f => new MfaFactor(
                    Id: f.Id,
                    Type: "totp",
                    Status: f.Status,
                    CreatedAt: f.CreatedAt
                )).ToList();
            }
            catch (GotrueException ex)
            {
                Console.WriteLine($"MFA ListFactors Gotrue error: {ex.Message} (StatusCode: {ex.StatusCode})");
                return new List<MfaFactor>();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"MFA ListFactors network error: {ex.Message}");
                return new List<MfaFactor>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MFA ListFactors unexpected error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return new List<MfaFactor>();
            }
        }

        public async Task<bool> UnenrollMfa(string factorId)
        {
            try
            {
                var response = await _client.Auth.Unenroll(new MfaUnenrollParams
                {
                    FactorId = factorId
                });

                if (response?.Id == null)
                {
                    Console.WriteLine("MFA Unenroll: response or response.Id is null");
                    return false;
                }

                return true;
            }
            catch (GotrueException ex)
            {
                Console.WriteLine($"MFA Unenroll Gotrue error: {ex.Message} (StatusCode: {ex.StatusCode})");
                return false;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"MFA Unenroll network error: {ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MFA Unenroll unexpected error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return false;
            }
        }
    }
}