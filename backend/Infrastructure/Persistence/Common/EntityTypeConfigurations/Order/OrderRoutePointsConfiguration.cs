using Domain.Models.Abstract;
using Domain.Models.Order;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Common.EntityTypeConfigurations.Order;

public class OrderRoutePointsConfiguration : EntityFieldConfiguration<RoutePoint<OrderEntity>, OrderEntity>
{
    public override void Configure(EntityTypeBuilder<RoutePoint<OrderEntity>> builder)
    {
        base.Configure(builder);
        builder.Property(rp => rp.LoadTimeStart)
            .HasColumnType("interval");
        builder.Property(rp => rp.LoadTimeEnd)
            .HasColumnType("interval");
    }
}