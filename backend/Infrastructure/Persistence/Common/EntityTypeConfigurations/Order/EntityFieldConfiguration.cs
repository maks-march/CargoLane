using Domain.Models.Abstract;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Common.EntityTypeConfigurations.Order;

public abstract class EntityFieldConfiguration<T, TEntity> : IEntityTypeConfiguration<T> where T : EntityField<TEntity> where TEntity : Entity
{
    public virtual void Configure(EntityTypeBuilder<T> builder)
    {
        builder.HasKey(t => t.Id);
    }
}