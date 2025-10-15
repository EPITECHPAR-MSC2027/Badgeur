using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("type_demande")]
public class TypeDemande : BaseModel
{
	[PrimaryKey("id", false)]
	public long Id { get; set; }

	[Column("nom")]
	public string Nom { get; set; } = default!;
}


