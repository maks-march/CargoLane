using Application.DTO.Chat;
using MediatR;

namespace Application.CQRS.ChatCQ.Queries;

public class GetChatHistoryQuery : IRequest<MessageVm[]>
{
    public Guid ChatId { get; set; }
    public Guid UserId { get; set; }
    public int Skip { get; set; } = 0;
    public int Take { get; set; } = 50;
}