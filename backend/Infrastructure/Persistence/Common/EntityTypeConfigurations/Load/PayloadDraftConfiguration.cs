using Domain.Models.Load;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

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