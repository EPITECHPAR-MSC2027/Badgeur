namespace badgeur_backend.Contracts.Responses
{
    public class RoomResponse
    {
        public required long Id { get; set; }
        public required string Name { get; set; }
        public required long IdFloor { get; set; }
    }
}

