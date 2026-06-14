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
    /// Email (может совпадать с Login).
    /// </summary>
    public string? Email { get; init; }

    /// <summary>
    /// Отображаемое имя пользователя.
    /// </summary>
    public string? Username { get; init; }

    /// <summary>
    /// Роль пользователя (User по умолчанию).
    /// </summary>
    public string? Role { get; init; }
}