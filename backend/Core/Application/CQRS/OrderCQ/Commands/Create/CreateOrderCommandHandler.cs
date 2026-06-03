using Application.Interfaces;
using AutoMapper;
using Domain.Models.Order;
using MediatR;

namespace Application.CQRS.OrderCQ.Commands.Create;

public class CreateOrderCommandHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<CreateOrderCommand, Guid>
{
    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var order = mapper.Map<OrderEntity>(request);
        
        order.Id = Guid.NewGuid();
        order.Created = DateTime.UtcNow;
        order.Updated = DateTime.UtcNow;
        
        order.Payment.Id = Guid.NewGuid();
        order.Payment.EntityId = order.Id;
        order.Transport.Id = Guid.NewGuid();
        order.Transport.EntityId = order.Id;
        
        for (var index = 0; index < order.Payloads.Count; index++)
        {
            var payload = order.Payloads[index];
            payload.Id = Guid.NewGuid();
            payload.EntityId = order.Id;
            payload.OrderIndex = index;
        }

        order.RoutePoints[0].IsLoad = true;
        for (var index = 0; index < order.RoutePoints.Count; index++)
        {
            var point = order.RoutePoints[index];
            point.Id = Guid.NewGuid();
            point.EntityId = order.Id;
            point.OrderIndex = index;
        }

        await dbContext.Orders.AddAsync(order, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return order.Id;
    }
}