namespace badgeur_backend.Contracts.Responses
{
    public class UserResponse
    {
        public long Id { get; set; }

        public required string FirstName { get; set; }

        public required string LastName { get; set; }

        public required string Email { get; set; }
        
        public required string Telephone { get; set; }

        public long RoleId { get; set; }

        public long TeamId { get; set; }
    }
}
