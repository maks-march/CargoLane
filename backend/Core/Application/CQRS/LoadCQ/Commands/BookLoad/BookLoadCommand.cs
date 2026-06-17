using MediatR;

namespace Application.CQRS.LoadCQ.Commands.BookLoad;

public record BookLoadCommand(Guid Id, Guid UserId) : IRequest<(string BookerName, int Article, Guid ownerId)>;