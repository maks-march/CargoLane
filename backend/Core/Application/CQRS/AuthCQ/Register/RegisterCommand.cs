using Application.DTO.Auth;
using MediatR;

namespace Application.CQRS.AuthCQ.Register;

public record RegisterCommand : IRequest<RegisterResponse>
{
    /// <summary>
    /// Логин пользователя (обычно email).
    /// </summary>
    public required string Login { get; init; }

    /// <summary>
    /// Пароль пользователя.
    /// </summary>
    public required string Password { get; init; }

    /// <summary>
    /// Отображаемое имя пользователя.
    /// </summary>
    public required string Username { get; init; }
}