using Application.CQRS.LoadCQ.Queries.Load.List;
using Application.DTO.Load;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain.Enums.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.AdminCQ.Queries;

public class GetReviewsQueryHandler(IAppDbContext dbContext, IMapper mapper) : LoadListSearch, IRequestHandler<GetReviewsQuery, LoadListVm[]>
{
    public async Task<LoadListVm[]> Handle(GetReviewsQuery request, CancellationToken cancellationToken)
    {
        var query = dbContext.Loads
            .AsNoTracking()
            .Include(l => l.User)
            .Include(l => l.RoutePoints)
            .Include(l => l.Payloads)
            .Select(x=>x);

        if (request.Status == null)
            query = query.Where(l => l.Status != LoadStatus.Rejected);
        else
            query = query.Where(l => l.Status == request.Status);
        
        query = Search(query, request);
        
        return await query
            .ProjectTo<LoadListVm>(mapper.ConfigurationProvider)
            .ToArrayAsync(cancellationToken);
    }
}