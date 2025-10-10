using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("teams")]
    public class Team : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("manager_id")]
    public long ManagerId { get; set; } = default!;

    [Column("team_name")]
    public string TeamName { get; set; } = default!;
}

