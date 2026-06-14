using Domain.Models.Load;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Common.EntityTypeConfigurations.Load;

public class PayloadConfiguration : EntityFieldConfiguration<Payload, LoadEntity>
{
    public override void Configure(EntityTypeBuilder<Payload> builder)
    {
        base.Configure(builder);
        builder.Property(u => u.Type)
            .HasConversion<string>();
    }
}