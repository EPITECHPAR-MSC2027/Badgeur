using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace bageur_backend.Models;

[Table("clocks")]
public class Clocks : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("user_id")]
    public long UserId { get; set; }

    [Column("date")]
    public DateTime Date { get; set; } // Only the date, no time

    [Column("time_arrived_at")]
    public DateTimeOffset TimeArrivedAt { get; set; }

    [Column("time_departed_at")]
    public DateTimeOffset TimeDepartedAt { get; set; }

}