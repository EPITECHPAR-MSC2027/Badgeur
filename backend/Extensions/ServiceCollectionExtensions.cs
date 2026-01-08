using Supabase;
using System.Text.Json.Serialization.Metadata;
using System.Diagnostics.CodeAnalysis;

namespace badgeur_backend.Extensions
{
    public static class ServiceCollectionExtensions
    {
        [UnconditionalSuppressMessage("Trimming", "IL2026:Members annotated with 'RequiresUnreferencedCodeAttribute' require dynamic access otherwise can break functionality when trimming application code", Justification = "DefaultJsonTypeInfoResolver is used for dynamic JSON serialization which is acceptable in this API context.")]
        [UnconditionalSuppressMessage("AOT", "IL3050:Calling members annotated with 'RequiresDynamicCodeAttribute' may break functionality when AOT compiling.", Justification = "DefaultJsonTypeInfoResolver is used for dynamic JSON serialization which is acceptable in this API context.")]
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

            services.ConfigureHttpJsonOptions(options =>
            {
                options.SerializerOptions.TypeInfoResolverChain.Insert(0, new DefaultJsonTypeInfoResolver());
            });

            return services;
        }
    }
}