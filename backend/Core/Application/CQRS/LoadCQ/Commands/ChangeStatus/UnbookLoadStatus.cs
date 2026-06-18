using MediatR;

namespace Application.CQRS.LoadCQ.Commands.ChangeStatus;

public record UnbookLoadStatus(Guid Id, Guid UserId) : IRequest<Guid>;