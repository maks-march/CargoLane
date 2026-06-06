using Application.Common.Services;
using Application.DTO.Chat;
using Application.Interfaces;
using AutoMapper;
using Domain.Models.Chat;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.ChatCQ.Commands;

public class SendMessageCommandHandler(
    IAppDbContext dbContext, 
    IHubContext<ChatHub> hubContext, // Внедряем хаб
    IMapper mapper) : IRequestHandler<SendMessageCommand, Guid>
{
    public async Task<Guid> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var message = new ChatMessageEntity
        {
            ChatId = request.ChatId,
            SenderId = request.SenderId,
            Text = request.Text,
            Created = DateTime.UtcNow,
            Id = Guid.NewGuid(),
            Updated = DateTime.UtcNow,
        };

        dbContext.Messages.Add(message);
        
        // Обновляем последнее сообщение в чате
        var chat = await dbContext.Chats
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == request.ChatId);
        
        chat!.LastMessage = message;
        await dbContext.SaveChangesAsync(cancellationToken);

        // SignalR: Отправляем уведомление всем участникам чата
        var messageVm = mapper.Map<MessageVm>(message);
        
        foreach (var participant in chat.Participants)
        {
            // Отправляем конкретному пользователю по его UserId
            await hubContext.Clients.User(participant.Id.ToString())
                .SendAsync("ReceiveMessage", messageVm, cancellationToken);
        }

        return message.Id;
    }
}