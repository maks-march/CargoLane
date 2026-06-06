using Application.Interfaces;
using Domain.Models.Chat;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.ChatCQ;

public class StartChatCommandHandler(IAppDbContext dbContext) : IRequestHandler<StartChatCommand, Guid>
{
    public async Task<Guid> Handle(StartChatCommand request, CancellationToken cancellationToken)
    {
        // Ищем чат, где есть оба участника
        var existingChatId = await dbContext.Chats
            .Where(c => c.Participants.Any(p => p.Id == request.CurrentUserId) && 
                        c.Participants.Any(p => p.Id == request.TargetUserId))
            .Select(c => c.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingChatId != Guid.Empty) 
            return existingChatId;

        // Если чата нет — создаем
        var currentUser = await dbContext.BusinessUsers.FindAsync(request.CurrentUserId);
        var targetUser = await dbContext.BusinessUsers.FindAsync(request.TargetUserId);

        var newChat = new ChatEntity
        {
            Id = Guid.NewGuid(),
            Created = DateTime.UtcNow,
            Updated = DateTime.UtcNow
        };
        newChat.Participants.Add(currentUser);
        newChat.Participants.Add(targetUser);

        dbContext.Chats.Add(newChat);
        await dbContext.SaveChangesAsync(cancellationToken);

        return newChat.Id;
    }
}