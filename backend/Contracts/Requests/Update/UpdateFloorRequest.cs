using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Update
{
    [JsonSerializable(typeof(UpdateFloorRequest))]
    public class UpdateFloorRequest
    {
        public int FloorNumber { get; set; } = default!;
    }
}

