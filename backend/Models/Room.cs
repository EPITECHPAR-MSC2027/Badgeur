using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("rooms")]
public class Room : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("id_floor")]
    public long IdFloor { get; set; }

    [Column("capacity")]
    public int Capacity { get; set; }

    [Column("has_largescreen")]
    public bool HasLargeScreen { get; set; }

    [Column("has_board")]
    public bool HasBoard { get; set; }

    [Column("has_mic")]
    public bool HasMic { get; set; }
}
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("room")]
public class Room : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = default!;

    [Column("id_floor")]
    public long IdFloor { get; set; }
}

