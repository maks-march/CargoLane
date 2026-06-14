/// <summary>
/// Смена пароля авторизованного пользователя.
/// </summary>
using MediatR;

namespace Application.CQRS.AuthCQ.ChangePassword;

/// <summary>
/// Смена пароля авторизованного пользователя.
/// UserId заполняется контроллером из BaseController.UserId.
/// </summary>
public record ChangePasswordCommand : IRequest<(bool Succeeded, string[] Errors)>
{
    public Guid UserId { get; set; }
    public required string CurrentPassword { get; init; }
    public required string NewPassword { get; init; }
}