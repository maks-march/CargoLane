using Domain.Models.Chat;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Common.EntityTypeConfigurations.Chat;

public class ChatConfiguration : IEntityTypeConfiguration<ChatEntity>
{
    public void Configure(EntityTypeBuilder<ChatEntity> builder)
    {
        // Настройка связи "Многие-ко-многим" между User и ChatEntity
        builder
            .HasMany(c => c.Participants)
            .WithMany(u => u.Chats)
            .UsingEntity(j => j.ToTable("ChatParticipants")); // Имя таблицы в БД

        // Последнее сообщение
        builder
            .HasOne(c => c.LastMessage)
            .WithMany()
            .HasForeignKey(c => c.LastMessageId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}