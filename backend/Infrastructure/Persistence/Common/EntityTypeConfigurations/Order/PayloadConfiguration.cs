using Domain.Models.Order;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Common.EntityTypeConfigurations.Order;

public class PayloadConfiguration : EntityFieldConfiguration<Payload, OrderEntity>
{
    public override void Configure(EntityTypeBuilder<Payload> builder)
    {
        base.Configure(builder);
        builder.Property(u => u.Wrap)
            .HasConversion<string>();
    }
}