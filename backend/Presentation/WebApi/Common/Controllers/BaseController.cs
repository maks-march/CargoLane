using System.Security.Claims;
using Application.CQRS.LoadCQ.Queries.Load.List;
using Application.CQRS.UserCQ.Queries.GetUserDetails;
using Application.CQRS.UserCQ.Queries.GetUserList;
using Domain.Enums.Load;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Common.Controllers;

/// <summary>
/// Базовая настройка контроллеров
/// </summary>
/// <param name="mediator">Медиатор - обрабатывает запросы</param>
[ApiController]
[Route("api/[controller]")]
public class BaseController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Модифицируем инъекцию из конструктора, как наследуемое поле только для чтения.
    /// </summary>
    protected readonly IMediator Mediator = mediator;
    
    internal Guid UserId
    {
        get
        {
            var identifier = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return User.Identity is { IsAuthenticated: true } && identifier != null
                ? Guid.Parse(identifier)
                : Guid.Empty;
        }
    }

    internal (int timezone, bool isMetric) UserSettings
    {
        get
        {
            var query = new GetUserDetailsQuery { Id = UserId};
            var userVm = Mediator.Send(query).Result;
            return (userVm.Timezone, userVm.IsMetric);
        }
    }
    
    [HttpGet("stats")]
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

public record StatsDto
{
    public int Uploads { get; set; }
    public int ClosedLoads { get; set; }
    public int Users { get; set; }
    public double MoneyVolume { get; set; }
}