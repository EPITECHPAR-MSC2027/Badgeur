using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("users")]
    public class User : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("first_name")]
    public string FirstName { get; set; } = default!;

    [Column("last_name")]
    public string LastName { get; set; } = default!;

    [Column("role_id")]
    public long RoleId { get; set; }

    [Column("team_id")]
    public long? TeamId { get; set; }

}

