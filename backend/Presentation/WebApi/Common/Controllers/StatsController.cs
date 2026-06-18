using Application.CQRS.LoadCQ.Queries.Load.List;
using Application.CQRS.UserCQ.Queries.GetUserList;
using Domain.Enums.Load;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WebApi.Common.Controllers.Abstract;

namespace WebApi.Common.Controllers;

/// <summary>
/// Контроллер для получения общей статистики платформы.
/// </summary>
public class StatsController(IMediator mediator) : BaseController(mediator)
{
    /// <summary>
    /// Получить сводную статистику: количество грузов, пользователей, закрытых заказов и объём денежных средств.
    /// </summary>
    /// <returns>Объект статистики платформы.</returns>
    /// <response code="200">Статистика успешно получена.</response>
    [HttpGet]
    [ProducesResponseType(typeof(StatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<StatsDto>> GetStats()
    {
        var loadsCommand = new GetLoadListQuery();
        var usersCommand = new GetUserListQuery();
        var loads = await Mediator.Send(loadsCommand);
        var users =  await Mediator.Send(usersCommand);
        var dto = new StatsDto()
        {
            Users = users.Count,
            Uploads = loads.Length,
            ClosedLoads = loads.Where(l => l.Status == nameof(LoadStatus.Closed)).ToArray().Length,
            MoneyVolume = loads.Sum(l => l.Payment)
        };
        return Ok(dto);
    }
}
