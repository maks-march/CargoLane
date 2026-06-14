using Application.CQRS.AuthCQ;
using Application.CQRS.AuthCQ.ChangePassword;
using Application.CQRS.AuthCQ.ForgotPassword;
using Application.CQRS.AuthCQ.Login;
using Application.CQRS.AuthCQ.Refresh;
using Application.CQRS.AuthCQ.Register;
using Application.CQRS.AuthCQ.ResetPassword;
using Application.DTO.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
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
    [ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var response = await Mediator.Send(command);
        // Return success + userId + confirmation token (as before); frontend can ignore token
        return Ok(response);
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
    
    /// <summary>
    /// Подтверждение email (POST по контракту из md: body {userId, token}).
    /// </summary>
    [HttpPost("confirm-email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailCommand command)
    {
        var result = await Mediator.Send(command);
        if (!result.Succeeded)
        {
            Console.WriteLine(string.Join("\n", result.Errors));
            return BadRequest(new { error = "Wrong Email or User", errors = result.Errors });
        }
        return Ok("Account confirmed");
    }

    // legacy GET for backward compatibility (optional)
    [HttpGet("confirm")]
    public async Task<IActionResult> ConfirmEmailLegacy([FromQuery] Guid userId, [FromQuery] string token)
        => await ConfirmEmail(new ConfirmEmailCommand(userId, token));

    /// <summary>
    /// Смена пароля авторизованного пользователя (по контракту md).
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command)
    {
        if (UserId == Guid.Empty) return Unauthorized();
        command.UserId = UserId; // enrich from authenticated context (BaseController)
        var result = await Mediator.Send(command);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors });
        return Ok();
    }

    /// <summary>
    /// Запрос на восстановление пароля (отправка кода на email).
    /// Публичный эндпоинт.
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
    {
        var result = await Mediator.Send(command);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors });
        return Ok(new { message = "If the email exists, a reset code has been sent." }); // don't leak existence
    }

    /// <summary>
    /// Сброс пароля по коду из forgot-password.
    /// Публичный эндпоинт.
    /// </summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        var result = await Mediator.Send(command);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors });
        return Ok(new { message = "Password has been reset successfully." });
    }
}