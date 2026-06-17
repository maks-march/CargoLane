using Domain.Enums.Load;
using MediatR;

namespace Application.CQRS.AdminCQ.Commands;

public record ChangeLoadStatus(Guid Id, Guid UserId, LoadStatus Status, string Reason = "") : IRequest<Guid>;