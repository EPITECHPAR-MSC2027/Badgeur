using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("notifications")]
public class Notification : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("user_id")]
    public long UserId { get; set; }

    [Column("message")]
    public string Message { get; set; } = default!;

    [Column("type")]
    public string Type { get; set; } = default!; // "badgeage", "reservation", "planning_sent", "planning_response", "planning_request"

    [Column("is_read")]
    public bool IsRead { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("related_id")]
    public long? RelatedId { get; set; } // ID de l'entité liée (planning, booking, etc.)
}

