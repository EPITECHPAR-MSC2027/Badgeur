using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("announcements")]
public class Announcement : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("title")]
    public string Title { get; set; } = default!;

    [Column("message")]
    public string Message { get; set; } = default!;

    [Column("author_id")]
    public long AuthorId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

