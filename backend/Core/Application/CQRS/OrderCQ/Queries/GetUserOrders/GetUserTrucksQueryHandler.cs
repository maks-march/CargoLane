using Application.Common.Exceptions;
using Application.DTO.Order;
using Application.DTO.Truck;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.OrderCQ.Queries.GetUserOrders;

public class GetUserOrdersQueryHandler(
    IAppDbContext dbContext, 
    IMapper mapper) : IRequestHandler<GetUserOrdersQuery, OrderListVm[]>
{
    public async Task<OrderListVm[]> Handle(GetUserOrdersQuery request, CancellationToken cancellationToken)
    {
        var user = dbContext.BusinessUsers
            .AsNoTracking()
            .FirstOrDefault(u => u.Id == request.Id);
        
        if (user == null)
            throw new NotFoundException("User not found", request.Id);
        
        return await dbContext.Orders
            .AsNoTracking()
            .Where(t => t.UserId ==  user.Id)
            .ProjectTo<OrderListVm>(mapper.ConfigurationProvider)
            .ToArrayAsync(cancellationToken);
    }
}