using Supabase;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace badgeur_backend.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddSupabase(this IServiceCollection services, IConfiguration config)
        {
            var url = config["Supabase:Url"]
                ?? throw new InvalidOperationException("Supabase:Url configuration is missing.");
            var key = config["Supabase:Key"]
                ?? throw new InvalidOperationException("Supabase:Key configuration is missing.");

            services.AddScoped(_ =>
                new Supabase.Client(
                    url,
                    key,
                    new SupabaseOptions { AutoRefreshToken = true }
                )
            );

            services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
            {
                options.SerializerOptions.TypeInfoResolver =
                    new System.Text.Json.Serialization.Metadata.DefaultJsonTypeInfoResolver();
            });

            return services;
        }
    }
}
