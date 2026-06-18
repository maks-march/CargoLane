using MediatR;

namespace Application.CQRS.LoadCQ.Commands.ChangeStatus;

public record CloseLoadStatus(Guid Id, Guid UserId) : IRequest<Guid>;