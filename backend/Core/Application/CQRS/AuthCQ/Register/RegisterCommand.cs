using MediatR;

namespace Application.CQRS.AuthCQ.Register;

public record RegisterCommand : IRequest<(bool Succeeded, Guid Id, string Token)>
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