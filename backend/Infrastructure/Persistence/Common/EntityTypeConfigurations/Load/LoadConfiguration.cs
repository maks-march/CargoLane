using Domain.Models.Load;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Common.EntityTypeConfigurations.Load;

public class LoadConfiguration : IEntityTypeConfiguration<LoadEntity>
{
    public void Configure(EntityTypeBuilder<LoadEntity> builder)
    {
        builder.HasKey(o => o.Id);
        builder.HasOne(o => o.User)
            .WithMany(u => u.Loads)
            .HasForeignKey(o => o.UserId);
        
        // Связи с коллекциями (один ко многим)
        builder.HasMany(o => o.Payloads)
            .WithOne(p => p.Entity)
            .HasForeignKey(p => p.EntityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(o => o.RoutePoints)
            .WithOne(p => p.Entity)
            .HasForeignKey(rp => rp.EntityId)
            .OnDelete(DeleteBehavior.Cascade);
               
        builder.HasMany(o => o.Photos)
            .WithOne(f => f.Owner)
            .HasForeignKey(f => f.OwnerId);
        
        builder
            .HasMany(l => l.UsersSaves)
            .WithMany(u => u.SavedLoads)
            .UsingEntity(j => j.ToTable("UserSavedLoads"));
    }
}