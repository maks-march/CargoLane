using Application.DTO.Load;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain.Enums.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Queries;

public class GetUserLoadsQuery : IRequest<LoadListVm[]>
{
    public Guid UserId { get; set; }
    
    public LoadStatus Status { get; set; } = LoadStatus.Active;
}

public class GetUserLoadsQueryHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<GetUserLoadsQuery, LoadListVm[]>
{
    public async Task<LoadListVm[]> Handle(GetUserLoadsQuery request, CancellationToken ct)
    {
        return await dbContext.Loads
            .Where(l => l.UserId == request.UserId &&  l.Status == request.Status)
            .AsNoTracking()
            .Include(l => l.RoutePoints)
            .Include(l => l.Payloads)
            .ProjectTo<LoadListVm>(mapper.ConfigurationProvider)
            .ToArrayAsync(ct);
    }
}