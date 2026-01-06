using badgeur_backend.Endpoints;
using badgeur_backend.Extensions;
using badgeur_backend.Services;
using badgeur_backend.Services.Auth;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

if (File.Exists(".env"))
{
    DotNetEnv.Env.Load();
}

// Add environment variables to configuration
builder.Configuration.AddEnvironmentVariables();

// --- Service configuration ---
builder.Services.AddSupabase(builder.Configuration);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthorization();

var bytes = Encoding.UTF8.GetBytes(builder.Configuration["Authentication:JwtSecret"]!);

builder.Services.AddAuthentication().AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(bytes),
        ValidAudience = builder.Configuration["Authentication:ValidAudience"],
        ValidIssuer = builder.Configuration["Authentication:ValidIssuer"],
    };
});

// Logging - Simple Console Format for Docker
builder.Logging.ClearProviders();
builder.Logging.AddSimpleConsole(options =>
{
    options.IncludeScopes = false;
    options.SingleLine = true;
    options.TimestampFormat = "[yyyy-MM-dd HH:mm:ss] ";
    options.ColorBehavior = Microsoft.Extensions.Logging.Console.LoggerColorBehavior.Disabled;
});

// Add HTTP logging with readable format
builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields =
        Microsoft.AspNetCore.HttpLogging.HttpLoggingFields.RequestMethod |
        Microsoft.AspNetCore.HttpLogging.HttpLoggingFields.RequestPath |
        Microsoft.AspNetCore.HttpLogging.HttpLoggingFields.ResponseStatusCode |
        Microsoft.AspNetCore.HttpLogging.HttpLoggingFields.Duration;
    logging.RequestBodyLogLimit = 4096;
    logging.ResponseBodyLogLimit = 4096;
});

// --- Scoped Services ---
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<BadgeLogEventService>();
builder.Services.AddScoped<RoleService>();
builder.Services.AddScoped<TeamService>();
builder.Services.AddScoped<UserKPIService>();
builder.Services.AddScoped<PlanningService>();
builder.Services.AddScoped<DemandTypeService>();
builder.Services.AddScoped<ClocksService>();
builder.Services.AddScoped<FloorService>();
builder.Services.AddScoped<RoomService>();
builder.Services.AddScoped<VehiculeService>();
builder.Services.AddScoped<BookingVehiculeService>();
builder.Services.AddScoped<AnnouncementService>();
builder.Services.AddScoped<TicketService>();
builder.Services.AddScoped<BookingRoomService>();

// --- Interfaces/Adapters/Misc ---
builder.Services.AddScoped<IAuthProvider, SupabaseAuthProvider>();
builder.Services.AddScoped<IAuthRegistration, SupabaseAuthRegistration>();
builder.Services.AddScoped<IUserLookup, UserServiceAdapter>();

var app = builder.Build();

// --- Middleware ---
// Add HTTP logging middleware (before authentication)
app.UseHttpLogging();

// Log application startup
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("🚀 Badgeur Backend starting up...");
logger.LogInformation("Environment: {Environment}", app.Environment.EnvironmentName);

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// --- Supabase Auth ---
app.UseSupabaseAuth();

// --- Endpoints ---
app.MapUserEndpoints();
app.MapLoginEndpoints();
app.MapRegistrationEndpoints();
app.MapBadgeLogEventEndpoints();
app.MapRoleEndpoints();
app.MapTeamEndpoints();
app.MapUserKPIEndpoints();
app.MapPlanningEndpoints();
app.MapTypeDemandeEndpoints();
app.MapClocksEndpoints();
app.MapFloorEndpoints();
app.MapRoomEndpoints();
app.MapVehiculeEndpoints();
app.MapBookingVehiculeEndpoints();
app.MapAnnouncementEndpoints();
app.MapTicketEndpoints();
app.MapBookingRoomEndpoints();

logger.LogInformation("✅ Badgeur Backend started successfully");

app.Run();