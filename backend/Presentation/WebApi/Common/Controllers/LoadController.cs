using Application.CQRS.LoadCQ.Commands;
using Application.CQRS.LoadCQ.Commands.CreateLoad;
using Application.CQRS.LoadCQ.Commands.DeleteLoad;
using Application.CQRS.LoadCQ.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.DTO;
using Application.DTO.Load;

namespace WebApi.Common.Controllers;

/// <summary>
/// Контроллер по управлению грузами (Load) и черновиками (Draft)
/// </summary>
[Authorize]
public class LoadController(IMediator mediator) : BaseController(mediator)
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
                await Mediator.Send(new GetLoadDetailQuery { Id = id })
                )
            );
    }

    /// <summary>
    /// Получить список заказов текущего авторизованного пользователя.
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(LoadListVm[]), StatusCodes.Status200OK)]
    public async Task<ActionResult<LoadListVm[]>> GetMy()
    {
        return Ok(
            ChangeListVmForUser(
                await Mediator.Send(new GetUserLoadsQuery { UserId = UserId })
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
                payload.Height *= 1.609;
                payload.Width *= 1.609;
                payload.Length *= 1.609;

                payload.Weight *= 0.4536;
            }
        }
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
        return Ok(await Mediator.Send(command));
    }

    /// <summary>
    /// Получить данные черновика.
    /// </summary>
    [HttpGet("draft/{id:guid}")]
    [ProducesResponseType(typeof(LoadDraftVm), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LoadDraftVm>> GetDraft(Guid id)
    {
        return Ok(await Mediator.Send(new GetLoadDraftQuery { Id = id, UserId = UserId }));
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

    private LoadDetailsVm ChangeVmForUser(LoadDetailsVm vm)
    {
        var settings = UserSettings;
        foreach (var route in vm.RoutePoints)
        {
            route.ArrivalTime = route.ArrivalTime.AddHours(settings.timezone);
        }

        if (!settings.isMetric)
        {
            vm.TotalWeight /= 1.609;
            vm.TotalVolume /= 1.609;
            foreach (var payload in vm.Payloads)
            {
                payload.Height /= 1.609;
                payload.Width /= 1.609;
                payload.Length /= 1.609;

                payload.Weight *= 2.20462;
            }
        }

        return vm;
    }
    
    private LoadListVm[] ChangeListVmForUser(LoadListVm[] vms)
    {
        var settings = UserSettings;
        foreach (var vm in vms)
        {
            vm.StartDate = vm.StartDate.AddHours(settings.timezone);
            if (!settings.isMetric)
            {
                vm.TotalWeight /= 1.609;
                vm.TotalVolume /= 1.609;
            }
        }

        return vms;
    }
}
