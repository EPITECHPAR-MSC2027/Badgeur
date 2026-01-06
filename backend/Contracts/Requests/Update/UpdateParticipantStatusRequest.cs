namespace badgeur_backend.Contracts.Requests.Update
{
    public class UpdateParticipantStatusRequest
    {
        public string Status { get; set; } = string.Empty; // "accepted", "declined" or "pending"
    }
}