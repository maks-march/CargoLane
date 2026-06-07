using Application.Common.Exceptions;
using Application.CQRS.AbstractHandlers;
using Application.Interfaces;
using AutoMapper;
using Domain.Models.Order;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.OrderCQ.Commands.Update;

public class UpdateOrderCommandHandler(IAppDbContext dbContext, IMapper mapper) 
    : UpdateCollectionCommandHandler(dbContext, mapper), IRequestHandler<UpdateOrderCommand, Guid>
{
    public async Task<Guid> Handle(UpdateOrderCommand request, CancellationToken cancellationToken)
    {
        var orderExists = await DbContext.Orders
            .AnyAsync(o => o.Id == request.Id && o.UserId == request.UserId, cancellationToken);
        if (!orderExists)
        {
            var exists = await DbContext.Orders.AnyAsync(o => o.Id == request.Id, cancellationToken);
            if (!exists) throw new NotFoundException(nameof(OrderEntity), request.Id);
            throw new ForbiddenException(nameof(OrderEntity), request.UserId);
        }
        
        var order = await DbContext.Orders
            .Include(order => order.User)
            .Include(order => order.Payment)
            .Include(order => order.Transport)
            .Include(order => order.Payloads
                .OrderBy(p => p.OrderIndex))
            .Include(order => order.RoutePoints
                .OrderBy(p => p.OrderIndex))
            .FirstAsync(order => order.Id == request.Id, cancellationToken);
        
        Mapper.Map(request, order);
        Mapper.Map(request.Payment, order.Payment);
        Mapper.Map(request.Transport, order.Transport);
        
        if (request.Payloads != null)
        {
            UpdateCollection(order.Payloads, request.Payloads, order);
        }
        
        if (request.RoutePoints != null)
        {
            UpdateCollection(order.RoutePoints, request.RoutePoints, order);
        }
        
        order.Updated = DateTime.UtcNow;
        await DbContext.SaveChangesAsync(cancellationToken);
        return order.Id;
    }
}