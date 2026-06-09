using Domain.Models.Load;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Common.EntityTypeConfigurations.Load;

public class LoadDraftConfiguration : IEntityTypeConfiguration<LoadDraft>
{
    public void Configure(EntityTypeBuilder<LoadDraft> builder)
    {
        builder.HasKey(o => o.Id);
        builder.HasOne(o => o.User)
            .WithMany(u => u.LoadsDrafts)
            .HasForeignKey(o => o.UserId);
        
        builder.HasMany(o => o.Payloads)
            .WithOne(p => p.Entity)
            .HasForeignKey(p => p.EntityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(o => o.RoutePoints)
            .WithOne(p => p.Entity)
            .HasForeignKey(rp => rp.EntityId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}