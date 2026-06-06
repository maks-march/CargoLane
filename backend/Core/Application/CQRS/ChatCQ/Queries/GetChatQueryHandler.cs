using Application.DTO.Chat;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.ChatCQ.Queries;

public class GetChatQueryHandler(IAppDbContext dbContext) 
    : IRequestHandler<GetChatQuery, ChatVm[]>
{
    public async Task<ChatVm[]> Handle(GetChatQuery request, CancellationToken cancellationToken)
    {
        return await dbContext.Chats
            .AsNoTracking()
            .Where(c => c.Participants.Any(p => p.Id == request.UserId))
            .OrderByDescending(c => c.LastMessage != null ? c.LastMessage.Created : c.Created)
            .Select(c => new ChatVm
            {
                Id = c.Id,
                // Выбираем участника, который НЕ является текущим пользователем
                ChatName = c.Participants
                    .Where(p => p.Id != request.UserId)
                    .Select(p => p.Name + " " + p.Surname)
                    .FirstOrDefault() ?? "Удаленный пользователь",
                
                ChatAvatarUrl = c.Participants
                    .Where(p => p.Id != request.UserId)
                    .Select(p => p.Avatar.FilePath) // Предполагаем наличие связи
                    .FirstOrDefault(),

                LastMessageText = c.LastMessage != null ? c.LastMessage.Text : "Сообщений нет",
                LastMessageTime = c.LastMessage != null ? c.LastMessage.Created : null,
                
                // Считаем непрочитанные сообщения, где отправитель не я
                UnreadCount = c.Messages.Count(m => !m.IsRead && m.SenderId != request.UserId)
            })
            .ToArrayAsync(cancellationToken);
    }
}