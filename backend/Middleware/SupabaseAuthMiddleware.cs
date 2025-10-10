using Supabase;
using System.Net.Http.Headers;

namespace badgeur_backend.Middleware
{
    public class SupabaseAuthMiddleware
    {
        private readonly RequestDelegate _next;

        public SupabaseAuthMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        // Intercepts each HTTP request and validates the Authorization header
        public async Task InvokeAsync(HttpContext context, Client supabaseClient)
        {
            if (context.Request.Path.StartsWithSegments("/login") ||
                context.Request.Path.StartsWithSegments("/register")) 
            {
                await _next(context);
                return;
            }

            // Check if there is an Authorization header in the request
            if (!context.Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                context.Response.StatusCode = 401;
                return;
            }

            // Parse the Authorization header value (With the format "Bearer <jwt_token>")
            var headerValue = authHeader.ToString();
            if (!AuthenticationHeaderValue.TryParse(headerValue, out var authenticationHeaderValue))
            {
                context.Response.StatusCode = 401;
                return;
            }

            // Check that the scheme is "Bearer" (case-sensitive)
            if (authenticationHeaderValue.Scheme != "Bearer")
            {
                context.Response.StatusCode = 401;
                return;
            }

            var token = authenticationHeaderValue.Parameter;
            if (string.IsNullOrEmpty(token))
            {
                context.Response.StatusCode = 401;
                return;
            }

            try
            {
                var user = await supabaseClient.Auth.GetUser(token);
                if (user == null)
                {
                    context.Response.StatusCode = 401;
                    return;
                }

                context.Items["User"] = user;

                // Call the next middleware/component in the pipeline.
                await _next(context);
            } 
            catch
            {
                // If an error occurs during validation, we return a 401 error
                context.Response.StatusCode = 401;
            }
        }
    }
}
