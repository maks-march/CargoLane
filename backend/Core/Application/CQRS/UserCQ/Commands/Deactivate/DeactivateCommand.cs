using MediatR;

namespace Application.CQRS.UserCQ.Commands.Deactivate;

public record DeactivateCommand(Guid UserId) : IRequest<bool>;