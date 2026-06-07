using Application.CQRS.AuthCQ;
using Application.CQRS.AuthCQ.Login;
using Application.CQRS.AuthCQ.Refresh;
using Application.CQRS.AuthCQ.Register;
using Application.DTO.Auth;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WebApi.DTO;

namespace WebApi.Common.Controllers;

/// <summary>
/// Контроллер для аутентификации и регистрации пользователей.
/// </summary>
public class AuthController(IMediator mediator, IConfiguration configuration) 
    : BaseController(mediator)
{
    /// <summary>
    /// Регистрирует нового пользователя в системе.
    /// </summary>
    /// <remarks>
    /// После успешной регистрации возвращает Access и Refresh токены.
    /// Пароль должен соответствовать политикам безопасности.
    /// </remarks>
    /// <param name="command">Данные для регистрации пользователя.</param>
    /// <returns>Возвращает токены и информацию о пользователе.</returns>
    /// <response code="200">Успешная регистрация.</response>
    /// <response code="400">Ошибка валидации или неверные данные.</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var response = await Mediator.Send(command);
        return Ok(response.Succeeded);
    }

    /// <summary>
    /// Выполняет вход в систему и выдает пару токенов.
    /// </summary>
    /// <param name="command">Логин и пароль пользователя.</param>
    /// <returns>Возвращает Access и Refresh токены.</returns>
    /// <response code="200">Успешный вход.</response>
    /// <response code="400">Ошибка валидации или неверные данные.</response>
    /// <response code="401">Неверный логин или пароль.</response>
    /// <response code="404">Пользователь с таким логином не найден.</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var response = await Mediator.Send(command);
        return Ok(response);
    }
    
    /// <summary>
    /// Запрос на обновление Access токена.
    /// </summary>
    /// <param name="command">Текущая пара токенов.</param>
    /// <returns>Возвращает Access и Refresh токены.</returns>
    /// <response code="200">Успешное обновление токенов.</response>
    /// <response code="401">Неверная пара токенов.</response>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] RefreshCommand command)
    {
        var response = await Mediator.Send(command);
        return Ok(response);
    }
    
    [HttpGet("confirm")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] Guid userId, [FromQuery] string token)
    {
        var result = await Mediator.Send(new ConfirmEmailCommand(userId, token));
        if (!result.Succeeded)
        {
            Console.WriteLine(string.Join("\n", result.Errors));
            return BadRequest("Wrong Email or User");
        }

        if (configuration["AppBaseUrl"] == null)
        {
            return Ok("Account confirmed");
        }
        return Redirect(configuration["AppBaseUrl"]);
    }
}