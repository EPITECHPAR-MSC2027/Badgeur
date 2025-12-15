using badgeur_backend.Contracts.Responses;
using badgeur_backend.Endpoints;
using badgeur_backend.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http.HttpResults;

namespace badgeur_backend_tests.Endpoints
{
    public class RoleEndpointsTests
    {
        private sealed class FakeRoleService : RoleService
        {
            private readonly List<RoleResponse> _roles;
            private readonly RoleResponse? _role;

            public FakeRoleService(
                List<RoleResponse>? roles = null,
                RoleResponse? role = null) : base(null!)
            {
                _roles = roles ?? new List<RoleResponse>();
                _role = role;
            }

            public override async Task<List<RoleResponse>> GetAllRolesAsync()
            {
                return await Task.FromResult(_roles);
            }

            public override async Task<RoleResponse?> GetRoleByIdAsync(long id)
            {
                return await Task.FromResult(_role);
            }
        }

        #region GetAllRoles Tests

        [Fact]
        public async Task HandleGetAllRoles_Returns_NotFound_When_No_Roles_Exist()
        {
            var roleService = new FakeRoleService(roles: new List<RoleResponse>());

            var result = await RoleEndpoints.HandleGetAllRoles(roleService);

            result.Should().BeOfType<NotFound<string>>();
            var notFound = (NotFound<string>)result;
            notFound.Value.Should().Be("No roles found.");
        }

        [Fact]
        public async Task HandleGetAllRoles_Returns_Ok_With_RoleList_On_Success()
        {
            var roles = new List<RoleResponse>
            {
                new RoleResponse { Id = 1, RoleName = "Admin" },
                new RoleResponse { Id = 2, RoleName = "Manager" },
                new RoleResponse { Id = 3, RoleName = "Employee" }
            };
            var roleService = new FakeRoleService(roles: roles);

            var result = await RoleEndpoints.HandleGetAllRoles(roleService);

            result.Should().BeOfType<Ok<List<RoleResponse>>>();
            var ok = (Ok<List<RoleResponse>>)result;
            ok.Value.Should().HaveCount(3);
            ok.Value![0].RoleName.Should().Be("Admin");
            ok.Value![1].RoleName.Should().Be("Manager");
            ok.Value![2].RoleName.Should().Be("Employee");
        }

        #endregion

        #region GetRoleById Tests

        [Fact]
        public async Task HandleGetRoleById_Returns_NotFound_When_Role_Does_Not_Exist()
        {
            var roleService = new FakeRoleService(role: null);

            var result = await RoleEndpoints.HandleGetRoleById(999, roleService);

            result.Should().BeOfType<NotFound<string>>();
            var notFound = (NotFound<string>)result;
            notFound.Value.Should().Be("Role was not found.");
        }

        [Fact]
        public async Task HandleGetRoleById_Returns_Ok_With_Role_On_Success()
        {
            var role = new RoleResponse { Id = 1, RoleName = "Admin" };
            var roleService = new FakeRoleService(role: role);

            var result = await RoleEndpoints.HandleGetRoleById(1, roleService);

            result.Should().BeOfType<Ok<RoleResponse>>();
            var ok = (Ok<RoleResponse>)result;
            ok.Value.Should().NotBeNull();
            ok.Value!.Id.Should().Be(1);
            ok.Value!.RoleName.Should().Be("Admin");
        }

        #endregion
    }
}