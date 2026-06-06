using Application.Common.Exceptions;
using Application.DTO.Chat;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.ChatCQ.Queries;

public class GetChatHistoryQueryHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<GetChatHistoryQuery, MessageVm[]>
{
    public async Task<MessageVm[]> Handle(GetChatHistoryQuery request, CancellationToken cancellationToken)
    {
        // 1. Проверяем, существует ли чат и является ли юзер его участником
        var isParticipant = await dbContext.Chats
            .AnyAsync(c => c.Id == request.ChatId && 
                           Enumerable.Any<User>(c.Participants, p => p.Id == request.UserId), 
                cancellationToken);

        if (!isParticipant)
        {
            // Бросаем Forbidden, чтобы Middleware превратил его в 403 ошибку
            throw new ForbiddenException("У вас нет доступа к этому чату", request.UserId);
        }

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