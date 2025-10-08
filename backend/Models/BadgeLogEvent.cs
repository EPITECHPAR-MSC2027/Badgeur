using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("badge_log_events")]
    public class BadgeLogEvent : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("badged_at")]
    public DateTime BadgedAt { get; set; } = default!;

    [Column("user_id")]
    public long UserId { get; set; } = default!;
}

