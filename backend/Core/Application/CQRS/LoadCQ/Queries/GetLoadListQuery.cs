using Application.Common.Extensions;
using Application.DTO.Load;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain.Enums.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Queries;

public class GetLoadListQuery : IRequest<LoadListVm[]>
{
    public string? StartCity { get; set; }
    public string? EndCity { get; set; }
    
    public DateOnly? FromDate { get; set; }
    public string? CargoType { get; set; }
    public string? VehicleType { get; set; }
    public double? Weight { get; set; }
    public double? Volume { get; set; }

    public SortChoices SortBy { get; set; } = SortChoices.PublicationDate;
    public bool IsDescending = false;
}

public enum SortChoices
{
    PublicationDate,
    Payment,
    MoveDate
}

public class GetLoadListQueryHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<GetLoadListQuery, LoadListVm[]>
{
    public async Task<LoadListVm[]> Handle(GetLoadListQuery request, CancellationToken ct)
    {
        var query = dbContext.Loads
            .AsNoTracking()
            .Include(l => l.RoutePoints)
            .Include(l => l.Payloads)
            .Where(l => l.Status == LoadStatus.Active);

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

        if (request.FromDate != null)
            query = query
                .Where(l => l.RoutePoints.Any() && l.RoutePoints
                    .OrderBy(rp => rp.OrderIndex)
                    .First().ArrivalTime.Date.ToDateOnly() >= request.FromDate.Value );
        
        if (!string.IsNullOrEmpty(request.CargoType))
            query = query
                .Where(l => l.CargoType == request.CargoType);
        
        if (!string.IsNullOrEmpty(request.VehicleType))
            query = query
                .Where(l => l.VehicleTypes.Any(x => x == request.VehicleType));
        
        
        if (request.Weight != null)
            query = query
                .Where(l => Math.Abs(l.TotalWeight - request.Weight.Value) < 100);
        
        if (request.Volume != null)
            query = query
                .Where(l => Math.Abs(l.TotalVolume - request.Volume.Value) < 100);

        switch (request.SortBy)
        {
            case SortChoices.PublicationDate:
                query = request.IsDescending ? 
                    query.OrderByDescending(l => l.Created) 
                    : query.OrderBy(l => l.Created);
                break;
            case SortChoices.Payment:
                query = request.IsDescending ? 
                    query.OrderByDescending(l => l.Payment) 
                    : query.OrderBy(l => l.Created);
                break;
            case SortChoices.MoveDate:
                query = request.IsDescending ? 
                    query.OrderByDescending(l => 
                        l.RoutePoints
                            .OrderBy(rp => rp.OrderIndex)
                            .First().ArrivalTime) 
                    : query.OrderBy(l => 
                        l.RoutePoints
                            .OrderBy(rp => rp.OrderIndex)
                            .First().ArrivalTime);
                break;
            default:
                throw new ArgumentOutOfRangeException();
        }
        
        return await query
            .ProjectTo<LoadListVm>(mapper.ConfigurationProvider)
            .ToArrayAsync(ct);
    }
}