using Application.Common.Exceptions;
using Application.DTO.Chat;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.ChatCQ.Queries;

public class GetChatHistoryQueryHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<GetChatHistoryQuery, MessageVm[]>
{
    public async Task<MessageVm[]> Handle(GetChatHistoryQuery request, CancellationToken cancellationToken)
    {
        // 1. Проверяем, существует ли чат и является ли юзер его участником
        var exist = await dbContext.Chats.AnyAsync(x => x.Id == request.ChatId);
        if (!exist)
            throw new NotFoundException("Chat not found", request.ChatId);
        
        var isParticipant = await dbContext.Chats
            .AnyAsync(c => c.Id == request.ChatId && 
                           Enumerable.Any(c.Participants, p => p.Id == request.UserId), 
                cancellationToken);

        if (!isParticipant)
        {
            // Бросаем Forbidden, чтобы Middleware превратил его в 403 ошибку
            throw new ForbiddenException("Access denied", request.UserId);
        }
        
        var unreadMessages = await dbContext.Messages
            .Where(m => m.ChatId == request.ChatId && m.SenderId != request.UserId && !m.IsRead)
            .ToListAsync(cancellationToken);

        foreach(var msg in unreadMessages) msg.IsRead = true;
        
        // 2. Тянем сообщения
        return await dbContext.Messages
            .AsNoTracking()
            .Where(m => m.ChatId == request.ChatId)
            .OrderByDescending(m => m.Created) // Сначала новые
            .Skip(request.Skip)
            .Take(request.Take)
            .ProjectTo<MessageVm>(mapper.ConfigurationProvider)
            .ToArrayAsync(cancellationToken);
    }
}