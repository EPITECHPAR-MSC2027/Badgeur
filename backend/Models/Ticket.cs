using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("tickets")]
public class Ticket : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("assigned_to")]
    public string AssignedTo { get; set; } = default!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("user_name")]
    public string UserName { get; set; } = default!;

    [Column("user_last_name")]
    public string UserLastName { get; set; } = default!;

    [Column("user_email")]
    public string UserEmail { get; set; } = default!;

    [Column("category")]
    public string Category { get; set; } = default!;

    [Column("description")]
    public string Description { get; set; } = default!;

    [Column("status")]
    public string Status { get; set; } = default!;
}

