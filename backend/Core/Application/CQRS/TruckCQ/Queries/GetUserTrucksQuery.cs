using Application.DTO.Truck;
using MediatR;

namespace Application.CQRS.TruckCQ.Queries;

public record GetUserTrucksQuery(Guid Id) : IRequest<TruckListVm[]>;