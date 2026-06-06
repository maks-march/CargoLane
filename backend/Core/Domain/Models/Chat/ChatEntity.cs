using Domain.Models.Abstract; // Твой базовый класс Entity

namespace Domain.Models.Chat;

public class ChatEntity : Entity
{
    // Участники чата (обычно 2 для P2P)
    public ICollection<User> Participants { get; set; } = new List<User>();
    
    // Все сообщения в чате
    public ICollection<ChatMessageEntity> Messages { get; set; } = new List<ChatMessageEntity>();

    // Ссылка на последнее сообщение для оптимизации списка чатов
    public Guid? LastMessageId { get; set; }
    public ChatMessageEntity? LastMessage { get; set; }
}