using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Create
{
    [JsonSerializable(typeof(CreateRoomRequest))]
    public class CreateRoomRequest
    {
        public string Name { get; set; } = string.Empty;
        public long IdFloor { get; set; }
        public int Capacity { get; set; }
        public bool HasLargeScreen { get; set; }
        public bool HasBoard { get; set; }
        public bool HasMic { get; set; }
    }
}

