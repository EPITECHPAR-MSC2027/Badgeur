using badgeur_backend.Endpoints;
using badgeur_backend.Extensions;
using badgeur_backend.Services;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- Service configuration ---
builder.Services.AddSupabase(builder.Configuration);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//builder.Services.AddControllers().AddNewtonsoftJson();

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

// --- Scoped Services ---
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<BadgeLogEventService>();
builder.Services.AddScoped<RoleService>();
builder.Services.AddScoped<TeamService>();
builder.Services.AddScoped<UserKPIService>();
builder.Services.AddScoped<PlanningService>();
builder.Services.AddScoped<DemandTypeService>();

var app = builder.Build();

// --- Middleware ---
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// En production, on pourrait activer HTTPS redirection si nécessaire
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

app.Run();
