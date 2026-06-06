using Application.CQRS.ChatCQ.Commands;
using Application.CQRS.ChatCQ.Queries;
using Application.DTO.Chat;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Common.Controllers;

[Authorize]
public class ChatController(IMediator mediator) : BaseController(mediator)
{
    /// <summary>
    /// Создать чат с пользователем или вернуть существующий
    /// </summary>
    [HttpPost("start/{userId:guid}")]
    public async Task<ActionResult<Guid>> StartChat(Guid userId)
    {
        return Ok(await Mediator.Send(new StartChatCommand 
        { 
            CurrentUserId = UserId, 
            TargetUserId = userId 
        }));
    }

    /// <summary>
    /// Отправить сообщение в чат
    /// </summary>
    [HttpPost("{id:guid}/messages")]
    public async Task<ActionResult<Guid>> SendMessage(Guid id, [FromBody] string text)
    {
        return Ok(await Mediator.Send(new SendMessageCommand 
        { 
            ChatId = id, 
            SenderId = UserId, 
            Text = text 
        }));
    }

    /// <summary>
    /// Получить историю сообщений (с пагинацией)
    /// </summary>
    [HttpGet("{id:guid}/messages")]
    public async Task<ActionResult<MessageVm[]>> GetHistory(Guid id, [FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        return Ok(await Mediator.Send(new GetChatHistoryQuery 
        { 
            ChatId = id, 
            UserId = UserId, 
            Skip = skip, 
            Take = take 
        }));
    }

    /// <summary>
    /// Список моих чатов
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ChatVm[]>> GetChats(Guid id)
    {
        return Ok(await Mediator.Send(new GetChatQuery { UserId = id }));
    }
}