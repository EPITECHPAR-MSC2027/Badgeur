using badgeur_backend.Contracts.Requests;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Models;
using Supabase;

namespace badgeur_backend.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/users");

            group.MapPost("/", async (CreateUserRequest request, Client client) =>
            {
                var user = new User
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    RoleId = request.RoleId,
                    TeamId = request.TeamId
                };

                var response = await client.From<User>().Insert(user);
                var newUser = response.Models.First();
                return Results.Ok(newUser.Id);
            });

            group.MapGet("/", async (Client client) =>
            {
                var response = await client.From<User>().Get();

                var users = response.Models;
                
                if (!users.Any()) return Results.NotFound("No users found.");

                var userResponses = users.Select(u => new UserResponse
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    RoleId = u.RoleId,
                    TeamId = u.TeamId != null ? (long) u.TeamId : 0

                }).ToList();

                return Results.Ok(userResponses);
            });

            group.MapGet("/{id:long}", async (long id, Client client) =>
            {
                var response = await client.From<User>()
                    .Where(n => n.Id == id)
                    .Get();

                var user = response.Models.FirstOrDefault();
                if (user is null) return Results.NotFound();

                return Results.Ok(new UserResponse
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    RoleId = user.RoleId,
                    TeamId = user.TeamId != null ? (long) user.TeamId : 0
                });
            });

            group.MapDelete("/{id:long}", async (long id, Client client) =>
            {
                await client.From<User>()
                    .Where(n => n.Id == id)
                    .Delete();

                return Results.NoContent();
            });
        }
    }
}
