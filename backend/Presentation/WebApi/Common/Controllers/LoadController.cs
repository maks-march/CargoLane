using Application.CQRS.ChatCQ.Commands;
using Application.CQRS.LoadCQ.Commands.BookLoad;
using Application.CQRS.LoadCQ.Commands.CreateLoad;
using Application.CQRS.LoadCQ.Commands.DeleteLoad;
using Application.CQRS.LoadCQ.Commands.Draft;
using Application.CQRS.LoadCQ.Commands.Draft.Create;
using Application.CQRS.LoadCQ.Commands.SaveLoad;
using Application.CQRS.LoadCQ.Commands.UploadFiles;
using Application.CQRS.LoadCQ.Queries.Draft;
using Application.CQRS.LoadCQ.Queries.Load.Detail;
using Application.CQRS.LoadCQ.Queries.Load.List;
using Application.CQRS.LoadCQ.Queries.Load.Saved;
using Application.CQRS.LoadCQ.Queries.Load.Users;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.DTO;
using Application.DTO.Load;
using WebApi.Common.Controllers.Abstract;

namespace WebApi.Common.Controllers;

/// <summary>
/// Контроллер по управлению грузами (Load) и черновиками (Draft)
/// </summary>
[Authorize]
public class LoadController(IMediator mediator) : BaseLoadController(mediator)
{
    #region Основные грузы (LoadEntity)

    /// <summary>
    /// Получить список активных заказов (грузов).
    /// </summary>
    [AllowAnonymous]
    [HttpGet]
    [ProducesResponseType(typeof(LoadListVm[]), StatusCodes.Status200OK)]
    public async Task<ActionResult<LoadListVm[]>> GetList([FromQuery] GetLoadListQuery query)
    {
        return Ok(
            ChangeListVmForUser(
                await Mediator.Send(query)
                )
            );
    }

    /// <summary>
    /// Получить детали конкретного заказа.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(LoadDetailsVm), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LoadDetailsVm>> GetDetails(Guid id)
    {
        return Ok(
            ChangeVmForUser(
                await Mediator.Send(new GetLoadDetailQuery(id))
                )
            );
    }

    /// <summary>
    /// Получить список заказов текущего авторизованного пользователя.
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(LoadListVm[]), StatusCodes.Status200OK)]
    public async Task<ActionResult<LoadListVm[]>> GetMy([FromQuery] string status = "Active")
    {
        return Ok(
            ChangeListVmForUser(
                await Mediator.Send(new GetUserLoadsQuery { UserId = UserId, Status = status})
                )
            );
    }
    
    
    /// <summary>
    /// Получить список СОХРАНЕННЫХ заказов текущего авторизованного пользователя.
    /// </summary>
    [HttpGet("user/saved")]
    [ProducesResponseType(typeof(LoadListVm[]), StatusCodes.Status200OK)]
    public async Task<ActionResult<LoadListVm[]>> GetMySaved()
    {
        return Ok(
            ChangeListVmForUser(
                await Mediator.Send(new GetUserSavedQuery { UserId = UserId })
            )
        );
    }

    /// <summary>
    /// Создать заказ (полная валидация).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateLoadCommand command)
    {
        command.UserId = UserId;
        var settings = UserSettings;
        foreach (var route in command.RoutePoints)
        {
            route.ArrivalTime = route.ArrivalTime.AddHours(-settings.timezone);
        }

        if (!settings.isMetric)
        {
            foreach (var payload in command.Payloads)
            {
                payload.Height *= ToMeter;
                payload.Width *= ToMeter;
                payload.Length *= ToMeter;

                payload.Weight *= 0.4536;
            }
        }
        return Ok(await Mediator.Send(command));
    }

    /// <summary>
    /// Сохранить заказ. Или убрать из сохраненных.
    /// </summary>
    [HttpPost("{id:guid}/save")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> Save(Guid id)
    {
        var command = new SaveLoadCommand(id, UserId);
        return Ok(await Mediator.Send(command));
    }
    
    /// <summary>
    /// Удалить заказ.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(Guid id)
    {
        await Mediator.Send(new DeleteLoadCommand(id, UserId));
        return NoContent();
    }

    [HttpPost("{id:guid}/book")]
    public async Task<ActionResult<Guid>> BookLoad(Guid id)
    {
        var command = new BookLoadCommand(id, UserId);
        var (bookerName, article, ownerId) = await Mediator.Send(command);
        var chatCommand = new StartChatCommand()
        {
            CurrentUserId = command.UserId,
            TargetUserId = ownerId,
            LoadId = id
        };
        var chatId = await Mediator.Send(chatCommand);
        var messageCommand = new SendMessageCommand
        {
            ChatId = chatId,
            SenderId = command.UserId,
            Text = $"{bookerName} has been booked load {article}."
        };
        await Mediator.Send(messageCommand);
        return Ok(chatId);
    }

    [HttpPut("{id:guid}/files")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> PutFiles(Guid id, [FromForm] IFormFile[] files)
    {
        await Mediator.Send(new UploadLoadFilesCommand { LoadId = id, UserId = UserId, Files = files });
        return NoContent();
    }

    #endregion

    #region Работа с черновиками (LoadDraft)

    /// <summary>
    /// Создать новый пустой или частично заполненный черновик.
    /// </summary>
    [HttpPost("draft")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    public async Task<ActionResult<Guid>> CreateDraft([FromBody] CreateLoadDraftCommand command)
    {
        command.UserId = UserId;
        var settings = UserSettings;
        foreach (var route in command.RoutePoints ?? [])
        {
            route.ArrivalTime = route.ArrivalTime.AddHours(-settings.timezone);
        }

        if (!settings.isMetric)
        {
            foreach (var payload in command.Payloads ?? [])
            {
                payload.Height *= ToMeter;
                payload.Width *= ToMeter;
                payload.Length *= ToMeter;

                payload.Weight *= 0.4536;
            }
        }
        return Ok(await Mediator.Send(command));
    }

    [HttpGet("draft/me")]
    [ProducesResponseType(typeof(LoadDraftVm[]), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LoadDraftVm[]>> GetMyDrafts()
    {
        var command = new GetUserLoadDraftQuery(UserId);
        var vms = await Mediator.Send(command);
        return vms.Select(vm => ChangeDraftVmForUser(vm)).ToArray();
    }
    
    /// <summary>
    /// Получить данные черновика.
    /// </summary>
    [HttpGet("draft/{id:guid}")]
    [ProducesResponseType(typeof(LoadDraftVm), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LoadDraftVm>> GetDraft(Guid id)
    {
        var vm = await Mediator.Send(new GetLoadDraftQuery { Id = id, UserId = UserId });
        
        return Ok(ChangeDraftVmForUser(vm));
    }

    /// <summary>
    /// Обновить данные черновика (без строгой валидации).
    /// </summary>
    [HttpPut("draft/{id:guid}")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    public async Task<ActionResult<Guid>> UpdateDraft(Guid id, [FromBody] UpdateLoadDraftCommand command)
    {
        command.Id = id;
        command.UserId = UserId;
        return Ok(await Mediator.Send(command));
    }

    /// <summary>
    /// Удалить черновик.
    /// </summary>
    [HttpDelete("draft/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> DeleteDraft(Guid id)
    {
        await Mediator.Send(new DeleteLoadDraftCommand(id, UserId));
        return NoContent();
    }

    #endregion
}