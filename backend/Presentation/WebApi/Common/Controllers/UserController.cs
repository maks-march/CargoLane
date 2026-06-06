using Application.CQRS.UserCQ.Commands.Create;
using Application.CQRS.UserCQ.Commands.Delete;
using Application.CQRS.UserCQ.Commands.Update;
using Application.CQRS.UserCQ.Queries.GetUserDetails;
using Application.CQRS.UserCQ.Queries.GetUserList;
using Application.DTO.User;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.DTO;

namespace WebApi.Common.Controllers;

/// <summary>
/// Контроллер для управления CRUD-операциями над пользователями (POST только для админов).
/// </summary>
[Authorize]
public class UserController(IMediator mediator) 
    : BaseController(mediator)
{
    /// <summary>
    /// Получает информацию о пользователе по его ID.
    /// </summary>
    /// <param name="id">Уникальный идентификатор пользователя.</param>
    /// <returns>DTO пользователя.</returns>
    /// <response code="200">Пользователь найден.</response>
    /// <response code="401">Не авторизован (токен отсутствует или невалиден).</response>
    /// <response code="404">Пользователь с таким ID не найден.</response>
    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(UserDetailsVm), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDetailsVm>> Get(Guid id)
    {
        var query = new GetUserDetailsQuery()
        {
            Id = id
        };
        var vm = await Mediator.Send(query);
        return Ok(vm);
    }
    
    /// <summary>
    /// Получает информацию о пользователе по его ID.
    /// </summary>
    /// <returns>DTO пользователя.</returns>
    /// <response code="200">Пользователь найден.</response>
    /// <response code="401">Не авторизован (токен отсутствует или невалиден).</response>
    /// <response code="404">Пользователь с текущей сессией не найден.</response>
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserDetailsVm), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDetailsVm>> GetMe()
    {
        return await Get(UserId);
    }
    
    /// <summary>
    /// Получает информацию о пользователях.
    /// </summary>
    /// <returns>DTO пользователей.</returns>
    /// <response code="200">Пользователи найдены.</response>
    /// <response code="401">Не авторизован (токен отсутствует или невалиден).</response>
    /// <response code="404">Пользователи не найдены.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ICollection<UserDetailsVm>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ICollection<UserDetailsVm>>> Get()
    {
        var query = new GetUserListQuery();
        var vm = await Mediator.Send(query);
        return Ok(vm);
    }

    /// <summary>
    /// Создает нового пользователя (только для админов).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Guid>> Post([FromBody] CreateUserCommand command)
    {
        var id = await Mediator.Send(command);
        return Ok(id);
    }
    
    /// <summary>
    /// Удаляет пользователя (только для админов).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDetailsVm>> Delete(Guid id)
    {
        var query = new DeleteUserCommand()
        {
            Id = id
        };
        await Mediator.Send(query);
        return NoContent();
    }
    
    /// <summary>
    /// Удаляет текущего пользователя.
    /// </summary>
    [HttpDelete("me")]
    public async Task<ActionResult<UserDetailsVm>> DeleteMe()
    {
        if (UserId == Guid.Empty)
            return Unauthorized();
        var query = new DeleteUserCommand()
        {
            Id = UserId
        };
        await Mediator.Send(query);
        return NoContent();
    }

    /// <summary>
    /// Обновляет информацию о пользователе по его ID.
    /// </summary>
    /// <param name="command">Данные для обновления пользователя.</param>
    /// <returns>Id пользователя.</returns>
    /// <response code="200">Пользователь обновлен.</response>
    /// <response code="400">Некорректный запрос, или невалидные данные.</response>
    /// <response code="401">Не авторизован (токен отсутствует или невалиден).</response>
    /// <response code="404">Пользователь с текущей сессией не найден.</response>
    [HttpPatch("me")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Guid>> UpdateMe([FromBody]UpdateUserCommand command)
    {
        if (UserId == Guid.Empty)
        {
            return Unauthorized();
        }
        command.Id = UserId;
        var id = await Mediator.Send(command);
        return Ok(id);
    }
}