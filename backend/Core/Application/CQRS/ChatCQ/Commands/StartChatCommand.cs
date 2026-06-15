using MediatR;

namespace Application.CQRS.ChatCQ.Commands;

public class StartChatCommand : IRequest<Guid>
{
    public Guid CurrentUserId { get; set; }
    public Guid TargetUserId { get; set; }
    public Guid? LoadId { get; set; }   // Добавлено по контракту md (POST /Messages/start с {partnerId, loadId})
}
