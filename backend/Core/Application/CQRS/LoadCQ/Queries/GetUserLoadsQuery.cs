using Application.DTO.Load;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class GetUserLoadsQuery : IRequest<LoadListVm[]>
{
    public Guid UserId { get; set; }
}

public class GetUserLoadsQueryHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<GetUserLoadsQuery, LoadListVm[]>
{
    public async Task<LoadListVm[]> Handle(GetUserLoadsQuery request, CancellationToken ct)
    {
        return await dbContext.Loads
            .Where(l => l.UserId == request.UserId)
            .AsNoTracking()
            .Include(l => l.RoutePoints)
            .Include(l => l.Payloads)
            .ProjectTo<LoadListVm>(mapper.ConfigurationProvider)
            .ToArrayAsync(ct);
    }
}
