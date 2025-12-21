using Supabase;
using Supabase.Gotrue;
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
            var session = await _client.Auth.SignInWithPassword(email, password);

            if (session == null || string.IsNullOrEmpty(session.AccessToken))
            {
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
            catch (Exception ex)
            {
                Console.WriteLine($"MFA Enroll error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
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
                    Console.WriteLine("MFA Verify: challenge is null");
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
                    Console.WriteLine("MFA Verify: verifyResponse is null");
                    return null;
                }

                return new MfaVerifyResponse(
                    AccessToken: verifyResponse.AccessToken,
                    RefreshToken: verifyResponse.RefreshToken ?? string.Empty
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MFA Verify error: {ex.Message}");
                throw;
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
                    return null;
                }

                return new MfaVerifyResponse(
                    AccessToken: challenge.Id,  // Return challenge ID here
                    RefreshToken: string.Empty
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MFA Challenge error: {ex.Message}");
                throw;
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
                    return null;
                }

                return new MfaVerifyResponse(
                    AccessToken: verifyResponse.AccessToken,
                    RefreshToken: verifyResponse.RefreshToken ?? string.Empty
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MFA VerifyChallenge error: {ex.Message}");
                throw;
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
                    return new List<MfaFactor>();
                }

                return factors.All.Select(f => new MfaFactor(
                    Id: f.Id,
                    Type: "totp",
                    Status: f.Status,
                    CreatedAt: f.CreatedAt
                )).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MFA ListFactors error: {ex.Message}");
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
                return response?.Id != null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MFA Unenroll error: {ex.Message}");
                return false;
            }
        }
    }
}