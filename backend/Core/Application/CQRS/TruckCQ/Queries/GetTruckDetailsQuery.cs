using MediatR;
using Application.DTO.Truck;

namespace Application.CQRS.TruckCQ.Queries;

public class GetTruckDetailsQuery : IRequest<TruckDetailsVm>
{
    public Guid Id { get; set; }
}