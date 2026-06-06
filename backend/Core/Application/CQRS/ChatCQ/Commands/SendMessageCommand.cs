using MediatR;

namespace Application.CQRS.ChatCQ.Commands;

public class SendMessageCommand : IRequest<Guid>
{
    public Guid ChatId { get; set; }
    public Guid SenderId { get; set; }
    public string Text { get; set; } = string.Empty;
}