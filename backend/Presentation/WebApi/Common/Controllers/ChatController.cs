using Application.CQRS.ChatCQ.Commands;
using Application.CQRS.ChatCQ.Queries;
using Application.DTO.Chat;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.Common.Controllers.Abstract;
using WebApi.DTO;

namespace WebApi.Common.Controllers;

/// <summary>
/// Контроллер для управления чатами и обменом сообщениями между пользователями.
/// </summary>
[Authorize]
public class ChatController(IMediator mediator) : BaseController(mediator)
{
    /// <summary>
    /// Создать чат с пользователем или вернуть существующий.
    /// </summary>
    /// <param name="userId">Идентификатор целевого пользователя.</param>
    /// <param name="loadId">Опциональный идентификатор груза, к которому привязан чат.</param>
    /// <returns>Идентификатор созданного или найденного чата.</returns>
    /// <response code="200">Чат успешно создан или найден.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="404">Целевой пользователь не найден.</response>
    [HttpPost("start/{userId:guid}")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Guid>> StartChat(Guid userId, [FromQuery] Guid loadId)
    {
        return Ok(await Mediator.Send(new StartChatCommand 
        { 
            CurrentUserId = UserId, 
            TargetUserId = userId,
            LoadId = loadId == Guid.Empty ? null : loadId
        }));
    }

    /// <summary>
    /// Отправить сообщение в чат.
    /// </summary>
    /// <param name="id">Идентификатор чата.</param>
    /// <param name="text">Текст сообщения.</param>
    /// <returns>Идентификатор созданного сообщения.</returns>
    /// <response code="200">Сообщение успешно отправлено.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="404">Чат не найден.</response>
    [HttpPost("{id:guid}/message")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
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
    /// Получить историю сообщений чата с пагинацией.
    /// </summary>
    /// <param name="id">Идентификатор чата.</param>
    /// <param name="skip">Количество сообщений для пропуска (по умолчанию 0).</param>
    /// <param name="take">Количество сообщений для выборки (по умолчанию 50).</param>
    /// <returns>Массив сообщений чата.</returns>
    /// <response code="200">Список сообщений успешно получен.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="404">Чат не найден.</response>
    [HttpGet("{id:guid}/messages")]
    [ProducesResponseType(typeof(MessageVm[]), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
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
    /// Получить список чатов указанного пользователя.
    /// </summary>
    /// <param name="id">Идентификатор пользователя.</param>
    /// <returns>Массив чатов пользователя.</returns>
    /// <response code="200">Список чатов успешно получен.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ChatVm[]), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ChatVm[]>> GetChats(Guid id)
    {
        return Ok(await Mediator.Send(new GetChatQuery { UserId = id }));
    }
    
    /// <summary>
    /// Получить список чатов текущего авторизованного пользователя.
    /// </summary>
    /// <returns>Массив чатов текущего пользователя.</returns>
    /// <response code="200">Список чатов успешно получен.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ChatVm[]), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ChatVm[]>> GetMyChats()
    {
        return Ok(await Mediator.Send(new GetChatQuery { UserId = UserId }));
    }
}
