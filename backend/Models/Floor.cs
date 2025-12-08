using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("floor")]
public class Floor : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("floor")]
    public int FloorNumber { get; set; }
}

