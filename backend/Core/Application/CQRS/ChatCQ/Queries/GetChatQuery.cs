using Application.DTO.Chat;
using MediatR;

namespace Application.CQRS.ChatCQ.Queries;

public record GetChatQuery : IRequest<ChatVm[]>
{
    public Guid UserId { get; set; }
}