using Domain.Models.Order;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Common.EntityTypeConfigurations.Order;

public class OrderConfiguration : IEntityTypeConfiguration<OrderEntity>
{
    public void Configure(EntityTypeBuilder<OrderEntity> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(o => o.Id);
        builder.HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId);
        
        builder.Property(u => u.Status)
            .HasConversion<string>();
        
        // Связи с вложенными сущностями (один к одному)
        builder.HasOne(o => o.Payment)
            .WithOne(p => p.Entity)
            .HasForeignKey<Payment>(p => p.EntityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(o => o.Transport)
            .WithOne(p => p.Entity)
            .HasForeignKey<Transport>(t => t.EntityId)
            .OnDelete(DeleteBehavior.Cascade);

        // Связи с коллекциями (один ко многим)
        builder.HasMany(o => o.Payloads)
            .WithOne(p => p.Entity)
            .HasForeignKey(p => p.EntityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(o => o.RoutePoints)
            .WithOne(p => p.Entity)
            .HasForeignKey(rp => rp.EntityId)
            .OnDelete(DeleteBehavior.Cascade);
               
        // Настройка для массивов строк
        builder.HasMany(o => o.Photos)
            .WithOne(f => f.Owner)
            .HasForeignKey(f => f.OwnerId);
    }
}