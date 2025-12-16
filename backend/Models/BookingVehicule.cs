using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("booking_vehicule")]
public class BookingVehicule : BaseModel
{
    [PrimaryKey("id_booking_vehicule", false)]
    public long IdBookingVehicule { get; set; }

    [Column("id_vehicule")]
    public long IdVehicule { get; set; }

    [Column("user_id")]
    public long UserId { get; set; }

    [Column("start_datetime")]
    public DateTime StartDatetime { get; set; }

    [Column("end_datetime")]
    public DateTime EndDatetime { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}

