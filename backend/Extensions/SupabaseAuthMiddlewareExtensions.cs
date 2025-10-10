using badgeur_backend.Middleware;

namespace badgeur_backend.Extensions
{
    public static class SupabaseAuthMiddlewareExtensions
    {
        public static IApplicationBuilder UseSupabaseAuth(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<SupabaseAuthMiddleware>();
        }
    }
}
