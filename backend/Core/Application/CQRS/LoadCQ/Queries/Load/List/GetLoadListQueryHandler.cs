using Application.DTO.Load;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Queries.Load.List;

public class GetLoadListQueryHandler(IAppDbContext dbContext, IMapper mapper) 
    : LoadListSearch, IRequestHandler<GetLoadListQuery, LoadListVm[]>
{
    public async Task<LoadListVm[]> Handle(GetLoadListQuery request, CancellationToken cancellationToken)
    {
        var query = dbContext.Loads
            .AsNoTracking()
            .Include(l => l.RoutePoints)
            .Include(l => l.Payloads)
            .Select(x => x);
        query = Search(query, request);
        query = Filter(query, request);
        query = Sort(query, request);
        
        return await query
            .ProjectTo<LoadListVm>(mapper.ConfigurationProvider)
            .ToArrayAsync(cancellationToken);
    }

}