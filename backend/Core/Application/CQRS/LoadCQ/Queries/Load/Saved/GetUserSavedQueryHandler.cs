using Application.Common.Exceptions;
using Application.CQRS.LoadCQ.Queries.Load.List;
using Application.DTO.Load;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Queries.Load.Saved;

public class GetUserSavedQueryHandler(IAppDbContext dbContext, IMapper mapper) 
    : LoadListSearch, IRequestHandler<GetUserSavedQuery, LoadListVm[]>
{
    public async Task<LoadListVm[]> Handle(GetUserSavedQuery request, CancellationToken cancellationToken)
    {
        var user = await dbContext.BusinessUsers
            .AsNoTracking()
            .Include(u => u.SavedLoads)
                .ThenInclude(l => l.RoutePoints)
            .Include(u => u.SavedLoads)
                .ThenInclude(l => l.Payloads)
            .FirstOrDefaultAsync(u => u.Id == request.UserId);
        
        if (user == null)
            throw new NotFoundException(nameof(User), request.UserId);
        
        var query = user.SavedLoads.AsQueryable();
        query = Search(query, request);
        query = Filter(query, request);
        query = Sort(query, request);
        
        return await query
            .ProjectTo<LoadListVm>(mapper.ConfigurationProvider)
            .ToArrayAsync(cancellationToken);
    }
}