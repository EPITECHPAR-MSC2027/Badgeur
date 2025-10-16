namespace badgeur_backend.Contracts.Requests
{
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
        
        public LoginRequest() { }
    }
}