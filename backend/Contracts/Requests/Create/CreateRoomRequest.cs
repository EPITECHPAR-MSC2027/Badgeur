using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Create
{
    [JsonSerializable(typeof(CreateRoomRequest))]
    public class CreateRoomRequest
    {
        public required string Name { get; set; }
        public required long IdFloor { get; set; }
    }
}

