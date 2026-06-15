using MediatR;

namespace Application.CQRS.ChatCQ.Commands;

public class StartChatCommand : IRequest<Guid>
{
    public Guid CurrentUserId { get; set; }
    public Guid TargetUserId { get; set; }
}
