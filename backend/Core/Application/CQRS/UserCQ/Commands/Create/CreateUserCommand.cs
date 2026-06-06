using MediatR;

namespace Application.CQRS.UserCQ.Commands.Create;

public record CreateUserCommand : IRequest<Guid>
{
    /// <summary>
    /// Имя пользователя (часть nickname)
    /// </summary>
    public required string FirstName { get; init; }
    /// <summary>
    /// Фамилия пользователя (часть nickname)
    /// </summary>
    public required string LastName { get; init; }
}