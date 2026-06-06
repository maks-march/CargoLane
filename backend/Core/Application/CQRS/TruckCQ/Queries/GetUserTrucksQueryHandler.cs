using Application.Common.Exceptions;
using Application.DTO.Truck;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.TruckCQ.Queries;

public class GetUserTrucksQueryHandler(
    IAppDbContext dbContext, 
    IMapper mapper) : IRequestHandler<GetUserTrucksQuery, TruckListVm[]>
{
    public async Task<TruckListVm[]> Handle(GetUserTrucksQuery request, CancellationToken cancellationToken)
    {
        var user = dbContext.BusinessUsers
            .AsNoTracking()
            .FirstOrDefault(u => u.Id == request.Id);
        
        if (user == null)
            throw new NotFoundException("User not found", request.Id);
        
        return await dbContext.Trucks
            .AsNoTracking()
            .Where(t => t.UserId ==  user.Id)
            .ProjectTo<TruckListVm>(mapper.ConfigurationProvider)
            .ToArrayAsync(cancellationToken);
    }
}