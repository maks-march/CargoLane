using Domain.Models.Abstract;

namespace Domain.Models.Chat;

public class ChatMessageEntity : Entity
{
    public Guid ChatId { get; set; }
    public ChatEntity Chat { get; set; } = null!;

    public Guid SenderId { get; set; }
    public User Sender { get; set; } = null!;

    public string Text { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
}