using Application.DTO.Load;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain.Enums.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class GetLoadListQuery : IRequest<LoadListVm[]>
{
    public string? StartCity { get; set; }
    public string? EndCity { get; set; }
    public DateOnly? FromDate { get; set; }
    public LoadStatus? Status { get; set; } = null;
}

public class GetLoadListQueryHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<GetLoadListQuery, LoadListVm[]>
{
    public async Task<LoadListVm[]> Handle(GetLoadListQuery request, CancellationToken ct)
    {
        var query = dbContext.Loads
            .AsNoTracking()
            .Where(l => request.Status == null ||  l.Status == request.Status); // Только активные

        if (!string.IsNullOrEmpty(request.StartCity))
            query = query
                .Where(l => l.RoutePoints.Any() && l.RoutePoints
                    .OrderBy(rp => rp.OrderIndex)
                    .First().City.Contains(request.StartCity));
        
        if (!string.IsNullOrEmpty(request.EndCity))
            query = query
                .Where(l => l.RoutePoints.Any() && l.RoutePoints
                    .OrderByDescending(rp => rp.OrderIndex)
                    .First().City.Contains(request.EndCity));
        return await query
            .ProjectTo<LoadListVm>(mapper.ConfigurationProvider)
            .ToArrayAsync(ct);
    }
}