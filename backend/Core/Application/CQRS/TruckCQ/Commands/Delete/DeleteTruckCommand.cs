using MediatR;

namespace Application.CQRS.TruckCQ.Commands.Delete;

public record DeleteTruckCommand(Guid Id, Guid UserId) : IRequest;