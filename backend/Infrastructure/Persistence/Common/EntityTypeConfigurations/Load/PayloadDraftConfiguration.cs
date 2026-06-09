using Domain.Models.Load;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Persistence.Common.EntityTypeConfigurations.Order;

namespace Persistence.Common.EntityTypeConfigurations.Load;

public class PayloadDraftConfiguration : EntityFieldConfiguration<PayloadDraft, LoadDraft>
{
    public override void Configure(EntityTypeBuilder<PayloadDraft> builder)
    {
        base.Configure(builder);
        builder.Property(u => u.Type)
            .HasConversion<string>();
    }
}