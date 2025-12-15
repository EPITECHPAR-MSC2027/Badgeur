namespace badgeur_backend.Contracts.Responses
{
    public class RoomResponse
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public long IdFloor { get; set; }
        public int Capacity { get; set; }
        public bool HasLargeScreen { get; set; }
        public bool HasBoard { get; set; }
        public bool HasMic { get; set; }
    }
}
namespace badgeur_backend.Contracts.Responses
{
    public class RoomResponse
    {
        public required long Id { get; set; }
        public required string Name { get; set; }
        public required long IdFloor { get; set; }
    }
}

