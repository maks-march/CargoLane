using Application.DTO.Load;
using MediatR;

namespace Application.CQRS.LoadCQ.Queries.Load.Detail;

public record GetLoadDetailQuery(Guid Id) : IRequest<LoadDetailsVm>
{ }