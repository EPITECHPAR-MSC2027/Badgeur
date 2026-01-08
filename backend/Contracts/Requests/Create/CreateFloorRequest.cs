using System.Text.Json.Serialization;

namespace badgeur_backend.Contracts.Requests.Create
{
    public class CreateFloorRequest
    {
        public required int FloorNumber { get; set; }
    }
}

