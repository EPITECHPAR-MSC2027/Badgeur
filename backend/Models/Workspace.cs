using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("workspace")]
public class Workspace : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("number")]
    public int Number { get; set; }

    [Column("id_floor")]
    public long IdFloor { get; set; }
}

