using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using ColumnAttribute = Supabase.Postgrest.Attributes.ColumnAttribute;
using TableAttribute = Supabase.Postgrest.Attributes.TableAttribute;

namespace badgeur_backend.Models
{
    [Table("user_kpis")]
    public class UserKPI : BaseModel
    {
        [PrimaryKey("id", false)]
        public long Id { get; set; }

        [Column("user_id")]
        public long UserId { get; set; }

        [Column("raat14")]
        public DateTimeOffset Raat14 { get; set; }

        [Column("raat28")]
        public DateTimeOffset Raat28 { get; set; }

        [Column("radt14")]
        public DateTimeOffset Radt14 { get; set; }

        [Column("radt28")]
        public DateTimeOffset Radt28 { get; set; }

        [Column("raw14")]
        public string Raw14 { get; set; } = default!;

        [Column("raw28")]
        public string Raw28 { get; set; } = default!;
    }
}
