using MediatR;

namespace Application.CQRS.AuthCQ.ResetPassword;

/// <summary>
/// Сброс пароля по коду (resetToken), полученному из forgot-password.
/// </summary>
public record ResetPasswordCommand : IRequest<(bool Succeeded, string[] Errors)>
{
    public required string Email { get; init; }
    public required string Code { get; init; }   // the resetToken from frontend
    public required string NewPassword { get; init; }
}