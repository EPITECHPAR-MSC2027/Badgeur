using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("roles")]
    public class Role : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("role_name")]
    public string RoleName { get; set; } = default!;
}

