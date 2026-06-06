namespace Application.DTO.Chat;

public record ChatVm
{
    public Guid Id { get; set; }
    
    // Данные собеседника (имя, аватар)
    public string ChatName { get; set; } = string.Empty;
    public string? ChatAvatarUrl { get; set; }
    
    // Превью последнего сообщения
    public string LastMessageText { get; set; } = string.Empty;
    public DateTime? LastMessageTime { get; set; }
    
    public int UnreadCount { get; set; }
}