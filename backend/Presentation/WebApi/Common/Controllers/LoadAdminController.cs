using Application.CQRS.AdminCQ.Commands;
using Application.CQRS.AdminCQ.Queries;
using Application.DTO.Load;
using Domain.Enums.Load;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.Common.Controllers.Abstract;
using WebApi.DTO;

namespace WebApi.Common.Controllers;

/// <summary>
/// Контроллер административной модерации грузов: просмотр, одобрение и отклонение заявок.
/// Доступен только пользователям с ролью Admin.
/// </summary>
[Authorize(Roles = "Admin")]
public class LoadAdminController(IMediator mediator) : BaseLoadController(mediator)
{
    /// <summary>
    /// Получить список грузов, ожидающих модерации (статус Pending).
    /// </summary>
    /// <returns>Массив грузов на проверке.</returns>
    /// <response code="200">Список успешно получен.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="403">Доступ запрещён (не администратор).</response>
    [HttpGet("reviews")]
    [ProducesResponseType(typeof(LoadListVm[]), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<LoadListVm[]>> GetReviews([FromQuery] string? searchBy)
    {
        var query = new GetReviewsQuery(LoadStatus.Pending, searchBy);
        return Ok(
            ChangeListVmForUser(
                await Mediator.Send(query)
            )
        );
    }
    
    /// <summary>
    /// Получить детали конкретного груза для модерации.
    /// </summary>
    /// <param name="id">Идентификатор груза.</param>
    /// <returns>Детали груза.</returns>
    /// <response code="200">Детали успешно получены.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="403">Доступ запрещён (не администратор).</response>
    /// <response code="404">Груз не найден.</response>
    [HttpGet("{id:guid}/review")]
    [ProducesResponseType(typeof(LoadDetailsVm), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LoadDetailsVm>> GetReview(Guid id)
    {
        var query = new GetReviewQuery(id);
        return Ok(
            ChangeVmForUser(
                await Mediator.Send(query)
            )
        );
    }
    
    /// <summary>
    /// Получить список всех одобренных грузов.
    /// </summary>
    /// <returns>Массив одобренных грузов.</returns>
    /// <response code="200">Список успешно получен.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="403">Доступ запрещён (не администратор).</response>
    [HttpGet("approved")]
    [ProducesResponseType(typeof(LoadListVm[]), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<LoadListVm[]>> GetApproved([FromQuery] string? searchBy)
    {
        var query = new GetReviewsQuery(null, searchBy);
        return Ok(
            ChangeListVmForUser(
                await Mediator.Send(query)
            )
        );
    }
    
    /// <summary>
    /// Получить список отклонённых грузов.
    /// </summary>
    /// <returns>Массив отклонённых грузов.</returns>
    /// <response code="200">Список успешно получен.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="403">Доступ запрещён (не администратор).</response>
    [HttpGet("rejected")]
    [ProducesResponseType(typeof(LoadListVm[]), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<LoadListVm[]>> GetRejected([FromQuery] string? searchBy)
    {
        var query = new GetReviewsQuery(LoadStatus.Rejected, searchBy);
        return Ok(
            ChangeListVmForUser(
                await Mediator.Send(query)
            )
        );
    }
    
    /// <summary>
    /// Одобрить груз — перевести в статус Active.
    /// </summary>
    /// <param name="id">Идентификатор груза.</param>
    /// <returns>Идентификатор одобренного груза.</returns>
    /// <response code="200">Груз успешно одобрен.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="403">Доступ запрещён (не администратор).</response>
    /// <response code="404">Груз не найден.</response>
    [HttpPost("{id:guid}/approve")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Guid>> Approve(Guid id)
    {
        var command = new ChangeLoadStatus(id, UserId, LoadStatus.Active);
        return Ok(await Mediator.Send(command));
    }
    
    /// <summary>
    /// Отклонить груз — перевести в статус Rejected с указанием причины.
    /// </summary>
    /// <param name="id">Идентификатор груза.</param>
    /// <param name="reason">Причина отклонения.</param>
    /// <returns>Идентификатор отклонённого груза.</returns>
    /// <response code="200">Груз успешно отклонён.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="403">Доступ запрещён (не администратор).</response>
    /// <response code="404">Груз не найден.</response>
    [HttpPost("{id:guid}/reject")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Guid>> Reject(Guid id, [FromBody] string reason)
    {
        var command = new ChangeLoadStatus(id, UserId, LoadStatus.Rejected, reason);
        return Ok(await Mediator.Send(command));
    }
}
