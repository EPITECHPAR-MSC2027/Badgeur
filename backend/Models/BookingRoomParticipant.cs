using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("booking_room_participant")]
public class BookingRoomParticipant : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("booking_id")]
    public long BookingId { get; set; }

    [Column("user_id")]
    public long UserId { get; set; }

    [Column("role")]
    public string Role { get; set; } = string.Empty;

    [Column("status")]
    public string Status { get; set; } = string.Empty;
}


