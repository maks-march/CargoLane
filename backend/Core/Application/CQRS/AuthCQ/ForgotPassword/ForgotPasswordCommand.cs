using MediatR;

namespace Application.CQRS.AuthCQ.ForgotPassword;

/// <summary>
/// Запрос на отправку кода/ссылки восстановления пароля.
/// </summary>
public record ForgotPasswordCommand : IRequest<(bool Succeeded, string[] Errors)>
{
    public required string Email { get; init; }
}