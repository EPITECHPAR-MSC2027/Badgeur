using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("planning")]
public class Planning : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("id_user")]
    public long UserId { get; set; }

    [Column("date")]
    public DateTime Date { get; set; }

    [Column("period")]
    public string Period { get; set; } = default!;

    [Column("statut")]
    public string Statut { get; set; } = default!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("id_type_demande")]
    public long DemandTypeId { get; set; }
}


