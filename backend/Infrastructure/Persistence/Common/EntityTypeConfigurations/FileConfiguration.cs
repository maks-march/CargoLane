using Domain.Models;
using Domain.Models.Abstract;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Common.EntityTypeConfigurations;

public class FileConfiguration<TOwner> : IEntityTypeConfiguration<FileEntity<TOwner>> where TOwner : Entity
{
    public void Configure(EntityTypeBuilder<FileEntity<TOwner>> builder)
    {
        builder.HasKey(x => x.Id);
    }
}