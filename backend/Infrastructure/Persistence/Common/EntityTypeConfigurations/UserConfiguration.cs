using Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Common.EntityTypeConfigurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.FirstName).HasMaxLength(50).IsRequired();
        builder.Property(x => x.LastName).HasMaxLength(50).IsRequired();
        
        builder
            .HasOne(u => u.Avatar)
            .WithOne(uf => uf.Owner)
            .HasForeignKey<User>(u => u.AvatarId)
            .OnDelete(DeleteBehavior.SetNull); // При удалении файла - AvatarId = null
    
        // Конфигурация для связи Certificates (один-ко-многим)
        builder
            .HasMany(u => u.Certificates)
            .WithOne() // Нет обратной навигации
            .HasForeignKey(f => f.OwnerId) // Теневой внешний ключ
            .OnDelete(DeleteBehavior.Cascade); // При удалении пользователя - удаляем все сертификаты
        
    }
}