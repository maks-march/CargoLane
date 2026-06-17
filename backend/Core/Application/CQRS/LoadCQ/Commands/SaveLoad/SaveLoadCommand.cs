using MediatR;

namespace Application.CQRS.LoadCQ.Commands.SaveLoad;

public record SaveLoadCommand(Guid Id, Guid UserId) : IRequest<bool>;