using Domain.Models.Order;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Common.EntityTypeConfigurations.Order;

public class PaymentConfiguration : EntityFieldConfiguration<Payment, OrderEntity>
{
    public override void Configure(EntityTypeBuilder<Payment> builder)
    {
        base.Configure(builder);
        
        builder.Property(u => u.PaymentType)
            .HasConversion<string>();
    }
}