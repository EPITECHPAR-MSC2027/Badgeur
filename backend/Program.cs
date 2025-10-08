using badgeur_backend.Extensions;
using badgeur_backend.Endpoints;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

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

var app = builder.Build();

// --- Middleware ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// --- Endpoints ---
app.MapUserEndpoints();

app.Run();
