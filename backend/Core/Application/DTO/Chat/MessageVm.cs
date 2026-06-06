namespace Application.DTO.Chat;

public record MessageVm
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public DateTime Created { get; set; }
    public bool IsRead { get; set; }
}