using Application.DTO.Auth;
using MediatR;

namespace Application.CQRS.AuthCQ.Register;

public record RegisterCommand : IRequest<AuthResponse>
{
    /// <summary>
    /// Логин пользователя - почта (скорее всего).
    /// </summary>
    public required string Login { get; init; }
    /// <summary>
    /// Пароль пользователя.
    /// </summary>
    public required string Password { get; init; }
}