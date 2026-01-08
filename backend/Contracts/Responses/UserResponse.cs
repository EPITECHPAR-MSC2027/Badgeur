namespace badgeur_backend.Contracts.Responses
{
    public class UserResponse
    {
        public long Id { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }
        
        public string Telephone { get; set; }

        public long RoleId { get; set; }

        public long TeamId { get; set; }
    }
}
