using Application.CQRS.TruckCQ.Commands.Create;
using Application.CQRS.TruckCQ.Commands.Delete;
using Application.CQRS.TruckCQ.Commands.Update;
using Application.CQRS.TruckCQ.Queries;
using Application.DTO.Truck;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.DTO;

namespace WebApi.Common.Controllers;

/// <summary>
/// Контроллер по управлению транспортом (грузовиками)
/// </summary>
[Authorize]
public class TruckController(IMediator mediator) : BaseController(mediator)
{
    /// <summary>
    /// Получает информацию о грузовике по его ID.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TruckDetailsVm), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TruckDetailsVm>> Get(Guid id)
    {
        var query = new GetTruckDetailsQuery { Id = id };
        return Ok(await Mediator.Send(query));
    }

    /// <summary>
    /// Получает список грузовиков с фильтрацией.
    /// </summary>
    [AllowAnonymous]
    [HttpGet]
    [ProducesResponseType(typeof(TruckListVm[]), StatusCodes.Status200OK)]
    public async Task<ActionResult<TruckListVm[]>> Get([FromQuery] GetTruckListQuery query)
    {
        return Ok(await Mediator.Send(query));
    }

    /// <summary>
    /// Добавляет новый грузовик.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Guid>> Post([FromBody] CreateTruckCommand command)
    {
        command.UserId = UserId;
        return Ok(await Mediator.Send(command));
    }

    /// <summary>
    /// Обновляет данные существующего грузовика.
    /// </summary>
    [HttpPatch("{id:guid}")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Guid>> Update(Guid id, [FromBody] UpdateTruckCommand command)
    {
        if (UserId == Guid.Empty)
            return Unauthorized();
            
        command.Id = id;
        command.UserId = UserId;
        return Ok(await Mediator.Send(command));
    }

    /// <summary>
    /// Удаляет грузовик.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(Guid id)
    {
        var command = new DeleteTruckCommand(id, UserId);
        await Mediator.Send(command);
        return NoContent();
    }
}