using Application.DTO.Load;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Queries.Load.Users;

public class GetUserLoadsQueryHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<GetUserLoadsQuery, LoadListVm[]>
{
    public async Task<LoadListVm[]> Handle(GetUserLoadsQuery request, CancellationToken ct)
    {
        var loads = await dbContext.Loads
            .Where(l => l.UserId == request.UserId && l.Status.ToString() == request.Status)
            .AsNoTracking()
            .Include(l => l.User)
            .Include(l => l.RoutePoints)
            .Include(l => l.Payloads)
            .ProjectTo<LoadListVm>(mapper.ConfigurationProvider)
            .ToArrayAsync(ct);
        return loads;
    }
}