using Application.CQRS.OrderCQ.Commands.Create;
using Application.CQRS.OrderCQ.Commands.Delete;
using Application.CQRS.OrderCQ.Commands.Update;
using Application.CQRS.OrderCQ.Queries.GetOrderDetails;
using Application.CQRS.OrderCQ.Queries.GetOrdersList;
using Application.CQRS.OrderCQ.Queries.GetUserOrders;
using Application.CQRS.PhotoCQ.Commands;
using Application.DTO.Order;
using Domain.Models.Order;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.DTO;

namespace WebApi.Common.Controllers;

/// <summary>
/// Контроллер по управлению заказами
/// </summary>
[Authorize]
public class OrderController(IMediator mediator) : BaseController(mediator)
{
    /// <summary>
    /// Получает информацию о заказе по его ID.
    /// </summary>
    /// <param name="id">Уникальный идентификатор заказа.</param>
    /// <returns>DTO заказа.</returns>
    /// <response code="200">Заказ найден.</response>
    /// <response code="400">Невалидные данные.</response>
    /// <response code="401">Не авторизован (токен отсутствует или невалиден).</response>
    /// <response code="404">Заказ с таким ID не найден.</response>
    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(OrderDetailsVm), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDetailsVm>> Get(Guid id)
    {
        var query = new GetOrderDetailsQuery() { Id = id };
        return Ok(await Mediator.Send(query));
    }
    
    /// <summary>
    /// Получает список отфильтрованных и отсортированных заказов
    /// </summary>
    /// <param name="query">Может содержать фильтры или параметр сортировки.</param>
    /// <returns>Список урезанных дто заказа</returns>
    [AllowAnonymous]
    [HttpGet]
    [ProducesResponseType(typeof(OrderDetailsVm), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderListVm[]>> GetList([FromQuery] GetOrderListQuery query)
    {
        return Ok(await Mediator.Send(query));
    }
    
    
    /// <summary>
    /// Получает список заказов принадлежащих пользователю.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("user/{id:guid}")]
    [ProducesResponseType(typeof(OrderListVm[]), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OrderListVm[]), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderListVm[]>> GetByUserId(Guid id)
    {
        return Ok(await Mediator.Send(new GetUserOrdersQuery(id)));
    }
    
    /// <summary>
    /// Получает список заказов принадлежащих текущему пользователю.
    /// </summary>
    [HttpGet("user/me")]
    [ProducesResponseType(typeof(OrderListVm[]), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OrderListVm[]), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderListVm[]>> GetMy()
    {
        if (UserId == Guid.Empty)
            throw new UnauthorizedAccessException("User unauthorized!");
        return await GetByUserId(UserId);
    }

    /// <summary>
    /// Создает заказ от имени пользователя.
    /// </summary>
    /// <param name="command">DTO создания заказа.</param>
    /// <returns>Id заказа.</returns>
    /// <response code="200">Заказ создан.</response>
    /// <response code="400">Невалидные данные.</response>
    /// <response code="401">Не авторизован (токен отсутствует или невалиден).</response>
    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Guid>> Post([FromBody]CreateOrderCommand command)
    {
        command.UserId = UserId;
        return Ok(await Mediator.Send(command));
    }

    /// <summary>
    /// Создает заказ от имени пользователя.
    /// </summary>
    /// <param name="id">Id обновлямого заказа.</param>
    /// <param name="command">DTO обновления заказа.</param>
    /// <returns>Id заказа.</returns>
    /// <response code="200">Заказ обновлен.</response>
    /// <response code="400">Невалидные данные.</response>
    /// <response code="401">Не авторизован (токен отсутствует или невалиден).</response>
    [HttpPatch("{id:guid}")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Guid>> Update(Guid id, [FromBody]UpdateOrderCommand command)
    {
        if (UserId == Guid.Empty)
            throw new UnauthorizedAccessException("User unauthorized!");
        command.Id = id;
        command.UserId = UserId;
        return Ok(await Mediator.Send(command));
    }

    /// <summary>
    /// Удаление заказа.
    /// </summary>
    /// <param name="id">Id удаляемого заказа.</param>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> Delete(Guid id)
    {
        var command = new DeleteOrderCommand(id, UserId);
        await Mediator.Send(command);
        return NoContent();
    }
    
    [HttpPut("{id:guid}/photos")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> PutPhotos(Guid id, [FromForm]PhotoDto? photos)
    {
        var command = new UploadPhotoCommand<OrderEntity>(id, UserId, photos?.Photos ?? []);
        await Mediator.Send(command);
        return NoContent();
    }
}