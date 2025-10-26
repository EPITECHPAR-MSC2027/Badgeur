using badgeur_backend.Contracts.Requests.Create;
using badgeur_backend.Contracts.Requests.Update;
using badgeur_backend.Contracts.Responses;
using badgeur_backend.Services;

namespace badgeur_backend.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/users");

            group.MapPost("/", async (CreateUserRequest request, UserService userService) =>
            {
                var id = await userService.CreateUserAsync(request);

                if (id == null)
                    return Results.BadRequest("Failed to create a new user.");

                return Results.Ok(id);
            }).WithDescription("Create a new user and returns the user ID.");

            group.MapGet("/", async (UserService userService) =>
            {
                var users = await userService.GetAllUsersAsync();

                if (!users.Any()) return Results.NotFound("No users found.");

                return Results.Ok(users);
            }).WithDescription("Retrieves all users from the database.");

            group.MapGet("/{id:long}", async (long id, UserService userService) =>
            {
                var user = await userService.GetUserByIdAsync(id);

                if (user == null) return Results.NotFound("User was not found.");

                return Results.Ok(user);
            }).WithDescription("Retrieve a user by their ID.");

            group.MapPut("/{id:long}/role", async (long id, UpdateUserRoleRequest request, UserService userService) =>
            {
                var updatedUser = await userService.updateUserRoleAsync(id, request.NewRoleId);

                if (updatedUser == null)
                    return Results.NotFound("User not found.");

                return Results.Ok(updatedUser);
            }).WithDescription("Update a user's role by their ID.");

            group.MapPut("/{id:long}", async (long id, UpdateUserRequest request, UserService userService) =>
            {
                var updatedUser = await userService.UpdateUserAsync(id, request);

                if (updatedUser == null)
                    return Results.NotFound("User not found");

                return Results.Ok(updatedUser);
            }).WithDescription("Update the user's information");

            group.MapGet("/{id:long}/clocks", async (long id, BadgeLogEventService badgeLogEventService) =>
            {
                UserSummaryResponse userSummary = await badgeLogEventService.GetUserSummaryAsync(id);

                return Results.Ok(userSummary);
            }).WithDescription("Get a summary of the arrivals and departures of an employee.");

            group.MapDelete("/{id:long}", async (long id, UserService userService) =>
            {
                await userService.DeleteUserAsync(id);

                return Results.NoContent();
            }).WithDescription("Delete a user by their ID.");

            group.MapGet("/{teamId:long}/team", async (long teamId, UserService userService) =>
            {
                var users = await userService.GetUsersByTeamIdAsync(teamId);

                if (!users.Any()) return Results.NotFound("No users found for the specified team.");

                return Results.Ok(users);
            }).WithDescription("Retrieve users by their team ID.");

        }
    }
}
