using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models;

[Table("vehicule")]
public class Vehicule : BaseModel
{
    [PrimaryKey("id", false)]
    public long Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = default!;

    [Column("capacity")]
    public long Capacity { get; set; }

    [Column("fuel_type")]
    public string FuelType { get; set; } = default!;

    [Column("license_plate")]
    public string LicensePlate { get; set; } = default!;

    [Column("transmission_type")]
    public string TransmissionType { get; set; } = default!;
}

