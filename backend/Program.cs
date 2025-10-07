using badgeur_backend.Extensions;
using badgeur_backend.Endpoints;

var builder = WebApplication.CreateBuilder(args);

// --- Service configuration ---
builder.Services.AddSupabase(builder.Configuration);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
