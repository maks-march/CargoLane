using Domain.Enums;
using MediatR;

namespace Application.CQRS.UserCQ.Commands.Create;

public record CreateUserCommand : IRequest<Guid>
{
    public string DisplayName { get; set; } = string.Empty;
    /// <summary>
    /// Имя пользователя (часть nickname)
    /// </summary>
    public required string Login { get; init; }
    /// <summary>
    /// Фамилия пользователя (часть nickname)
    /// </summary>
    public required string Password { get; init; }

    public required string Role { get; set; } = RoleMapping.User;
}