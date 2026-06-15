using Application.CQRS.ChatCQ.Commands;
using Application.CQRS.ChatCQ.Queries;
using Application.DTO.Chat;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Common.Controllers;

[Authorize]
public class MessagesController(IMediator mediator) : BaseController(mediator)
{
    /// <summary>
    /// Начать чат с партнёром (или вернуть существующий).
    /// Поддержка loadId для связи чата со сделкой (по контракту md).
    /// </summary>
    [HttpPost("start")]
    public async Task<ActionResult<Guid>> StartChat([FromBody] StartChatRequest request)
    {
        return Ok(await Mediator.Send(new StartChatCommand
        {
            CurrentUserId = UserId,
            TargetUserId = request.PartnerId,
            LoadId = request.LoadId
        }));
    }

    /// <summary>
    /// Отправить сообщение в чат.
    /// Поддержка isSystem (системные сообщения, по контракту md).
    /// </summary>
    [HttpPost("{chatId:guid}/send")]
    public async Task<ActionResult<Guid>> SendMessage(Guid chatId, [FromBody] SendMessageRequest body)
    {
        return Ok(await Mediator.Send(new SendMessageCommand
        {
            ChatId = chatId,
            SenderId = UserId,
            Text = body.Text,
            IsSystem = body.IsSystem
        }));
    }

    /// <summary>
    /// История сообщений чата (с пагинацией).
    /// </summary>
    [HttpGet("{chatId:guid}/history")]
    public async Task<ActionResult<MessageVm[]>> GetHistory(Guid chatId, [FromQuery] int skip = 0, [FromQuery] int take = 50)
    {
        return Ok(await Mediator.Send(new GetChatHistoryQuery
        {
            ChatId = chatId,
            UserId = UserId,
            Skip = skip,
            Take = take
        }));
    }

    /// <summary>
    /// Список чатов текущего пользователя (соответствует GET /chats из md).
    /// </summary>
    [HttpGet("chats")]
    public async Task<ActionResult<ChatVm[]>> GetMyChats()
    {
        return Ok(await Mediator.Send(new GetChatQuery { UserId = UserId }));
    }

    /// <summary>
    /// Информация о сделке, связанной с чатом (заглушка по контракту md).
    /// </summary>
    [HttpGet("{chatId:guid}/deal")]
    public async Task<ActionResult<object>> GetDeal(Guid chatId)
    {
        // TODO: Реализовать полноценный ActiveDealDto + логику связи чата с грузом/сделкой.
        // Пока возвращаем минимальную заглушку, чтобы фронт не падал.
        return Ok(new
        {
            ChatId = chatId,
            LoadId = (Guid?)null,
            Status = "Active",
            Message = "Deal integration is not fully implemented yet (placeholder)"
        });
    }

    // === DTO для тел запросов (чтобы фронт мог присылать объекты) ===

    public record StartChatRequest(Guid PartnerId, Guid? LoadId);
    public record SendMessageRequest(string Text, bool IsSystem = false);
}
