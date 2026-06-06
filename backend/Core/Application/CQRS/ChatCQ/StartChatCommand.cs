using MediatR;

namespace Application.CQRS.ChatCQ;

public class StartChatCommand : IRequest<Guid>
{
    public Guid CurrentUserId { get; set; }
    public Guid TargetUserId { get; set; }
}