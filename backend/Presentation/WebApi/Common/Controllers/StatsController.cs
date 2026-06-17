using Application.CQRS.LoadCQ.Queries.Load.List;
using Application.CQRS.UserCQ.Queries.GetUserList;
using Domain.Enums.Load;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WebApi.Common.Controllers.Abstract;

namespace WebApi.Common.Controllers;

public class StatsController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
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