using Application.CQRS.UserCQ.Commands.Create;
using Application.CQRS.UserCQ.Commands.Deactivate;
using Application.CQRS.UserCQ.Commands.Delete;
using Application.CQRS.UserCQ.Commands.DeleteAvatar;
using Application.CQRS.UserCQ.Commands.Update;
using Application.CQRS.UserCQ.Commands.UploadAvatar;
using Application.CQRS.UserCQ.Queries.GetUserDetails;
using Application.CQRS.UserCQ.Queries.GetUserList;
using Application.DTO.User;
using Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.Common.Controllers.Abstract;
using WebApi.DTO;

namespace WebApi.Common.Controllers;

/// <summary>
/// Контроллер для управления пользователями: профиль, аватар, деактивация.
/// </summary>
[Authorize]
public class UserController(IMediator mediator) : BaseController(mediator)
{
    #region Администрирование пользователей (Admin)
    
    /// <summary>
    /// Получить список всех пользователей. Только для администратора.
    /// </summary>
    /// <returns>Коллекция пользователей.</returns>
    /// <response code="200">Список пользователей успешно получен.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="403">Доступ запрещён (не администратор).</response>
    [Authorize(Roles = "Admin")]
    [HttpGet]
    [ProducesResponseType(typeof(ICollection<UserDetailsVm>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ICollection<UserDetailsVm>>> Get()
    {
        var query = new GetUserListQuery();
        var vm = await Mediator.Send(query);
        return Ok(vm);
    }

    /// <summary>
    /// Создать нового пользователя. Только для администратора.
    /// </summary>
    /// <param name="command">Данные нового пользователя.</param>
    /// <returns>Идентификатор созданного пользователя.</returns>
    /// <response code="200">Пользователь успешно создан.</response>
    /// <response code="400">Ошибка валидации данных.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="403">Доступ запрещён (не администратор).</response>
    [Authorize(Roles = "Admin")]
    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<Guid>> Post([FromBody] CreateUserCommand command)
        => Ok(await Mediator.Send(command));

    [Authorize(Roles = "Admin")]
    [HttpPost("admin")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<Guid>> PostAdmin([FromBody] CreateUserCommand command)
    {
        command.Role = RoleMapping.Admin;
        return Ok(await Mediator.Send(command));
    }
    
    /// <summary>
    /// Удалить пользователя по идентификатору. Только для администратора.
    /// </summary>
    /// <param name="id">Идентификатор удаляемого пользователя.</param>
    /// <response code="204">Пользователь успешно удалён.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    /// <response code="403">Доступ запрещён (не администратор).</response>
    /// <response code="404">Пользователь не найден.</response>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await Mediator.Send(new DeleteUserCommand { Id = id });
        return NoContent();
    }
    
    #endregion

    #region Профиль текущего пользователя

    /// <summary>
    /// Удалить аккаунт текущего авторизованного пользователя.
    /// </summary>
    /// <response code="204">Аккаунт успешно удалён.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    [HttpDelete("me")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteMe()
    {
        await Mediator.Send(new DeleteUserCommand { Id = UserId });
        return NoContent();
    }
    
    /// <summary>
    /// Получить профиль пользователя по идентификатору. Доступно анонимно.
    /// </summary>
    /// <param name="id">Идентификатор пользователя.</param>
    /// <returns>Данные профиля пользователя.</returns>
    /// <response code="200">Профиль найден.</response>
    /// <response code="404">Пользователь не найден.</response>
    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(UserDetailsVm), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDetailsVm>> Get(Guid id)
    {
        var query = new GetUserDetailsQuery { Id = id };
        var vm = await Mediator.Send(query);
        return Ok(vm);
    }
    
    /// <summary>
    /// Получить профиль текущего авторизованного пользователя.
    /// </summary>
    /// <returns>Данные профиля текущего пользователя.</returns>
    /// <response code="200">Профиль получен.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserDetailsVm), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserDetailsVm>> GetMe() => await Get(UserId);
    
    /// <summary>
    /// Обновить профиль текущего авторизованного пользователя (частичное обновление).
    /// </summary>
    /// <param name="command">Поля для обновления. Null-поля не перезаписываются.</param>
    /// <returns>Идентификатор обновлённого пользователя.</returns>
    /// <response code="200">Профиль успешно обновлён.</response>
    /// <response code="400">Ошибка валидации данных.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    [HttpPatch("me")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Guid>> UpdateMe([FromBody] UpdateUserCommand command)
    {
        if (UserId == Guid.Empty) return Unauthorized();
        command.Id = UserId;
        return Ok(await Mediator.Send(command));
    }

    #endregion

    #region Деактивация

    /// <summary>
    /// Деактивировать аккаунт текущего пользователя.
    /// Блокирует логин и инвалидирует все токены.
    /// </summary>
    /// <response code="200">Аккаунт успешно деактивирован.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    [HttpPost("deactivate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> Deactivate()
    {
        await Mediator.Send(new DeactivateCommand(UserId));
        return Ok();
    }

    #endregion

    #region Аватар
    
    /// <summary>
    /// Загрузить или обновить аватар текущего пользователя.
    /// </summary>
    /// <param name="avatar">Файл изображения (JPEG, PNG).</param>
    /// <response code="204">Аватар успешно загружен.</response>
    /// <response code="400">Некорректный файл.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    [HttpPost("avatar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UploadAvatar([FromForm] FileDto avatar)
    {
        await Mediator.Send(new UploadUserAvatarCommand { UserId = UserId, Avatar = avatar.File });
        return NoContent();
    }

    /// <summary>
    /// Удалить аватар текущего пользователя.
    /// </summary>
    /// <response code="204">Аватар успешно удалён.</response>
    /// <response code="401">Пользователь не авторизован.</response>
    [HttpDelete("avatar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteAvatar()
    {
        if (UserId == Guid.Empty) return Unauthorized();
        await Mediator.Send(new DeleteUserAvatarCommand(UserId));
        return NoContent();
    }

    #endregion
}
