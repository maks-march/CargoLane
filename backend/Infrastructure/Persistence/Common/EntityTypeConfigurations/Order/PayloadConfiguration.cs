using Domain.Models.Order;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Common.EntityTypeConfigurations.Order;

public class PayloadConfiguration : EntityFieldConfiguration<PayloadOrder, OrderEntity>
{
    public override void Configure(EntityTypeBuilder<PayloadOrder> builder)
    {
        base.Configure(builder);
        builder.Property(u => u.Wrap)
            .HasConversion<string>();
    }
}