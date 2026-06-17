using Application.Common.Exceptions;
using Application.Interfaces;
using Domain.Models.Chat;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.ChatCQ.Commands;

public class StartChatCommandHandler(IAppDbContext dbContext) : IRequestHandler<StartChatCommand, Guid>
{
    public async Task<Guid> Handle(StartChatCommand request, CancellationToken cancellationToken)
    {
        if (request.CurrentUserId == request.TargetUserId)
            throw new InvalidOperationException("Chat with yourself permitted");
        
        // Ищем чат, где есть оба участника
        var existingChatId = await dbContext.Chats
            .Where(c => c.Participants.Any(p => p.Id == request.CurrentUserId) && 
                        c.Participants.Any(p => p.Id == request.TargetUserId))
            .Select(c => c.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingChatId != Guid.Empty) 
            return existingChatId;

        // Если чата нет — создаем
        var currentUser = await dbContext.BusinessUsers.FindAsync([request.CurrentUserId], cancellationToken);
        var targetUser = await dbContext.BusinessUsers.FindAsync([request.TargetUserId], cancellationToken);
        
        if (currentUser == null || targetUser == null)
            throw new NotFoundException("Addressed user not found", request.TargetUserId);
        
        var newChat = new ChatEntity
        {
            Id = Guid.NewGuid(),
            Created = DateTime.UtcNow,
            Updated = DateTime.UtcNow,
            LoadId = request.LoadId,
            // LoadId можно сохранить в будущем (пока не добавляем в модель, чтобы не ломать миграции)
        };
        newChat.Participants.Add(currentUser);
        newChat.Participants.Add(targetUser);

        dbContext.Chats.Add(newChat);
        await dbContext.SaveChangesAsync(cancellationToken);

        return newChat.Id;
    }
}
