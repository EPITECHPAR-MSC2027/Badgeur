using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("booking_room")]
public class BookingRoom : BaseModel
{
    [PrimaryKey("id_booking", false)]
    public long Id { get; set; }

    [Column("user_id")]
    public long UserId { get; set; }

    [Column("id_room")]
    public long RoomId { get; set; }

    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("start_datetime")]
    public DateTime StartDatetime { get; set; }

    [Column("end_datetime")]
    public DateTime EndDatetime { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}


