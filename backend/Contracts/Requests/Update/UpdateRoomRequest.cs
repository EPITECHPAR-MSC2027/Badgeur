using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Update
{
    [JsonSerializable(typeof(UpdateRoomRequest))]
    public class UpdateRoomRequest
    {
        public string Name { get; set; } = default!;
        public long IdFloor { get; set; } = default!;
    }
}

