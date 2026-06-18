using Application.Common.Extensions;
using Domain.Models.Load;

namespace Application.CQRS.LoadCQ.Queries.Load.List;

public class LoadListSearch
{
    protected IQueryable<LoadEntity> Search(IQueryable<LoadEntity> query, ISearchQuery request)
    {
        if (!string.IsNullOrWhiteSpace(request.SearchBy))
        {
            var search = request.SearchBy.ToLower();

            query = query.Where(l =>
                l.Id.ToString().ToLower().Contains(search) ||
                l.RoutePoints.Any(rp => rp.City.ToLower().Contains(search)) ||
                l.About.ToLower().Contains(search) || 
                l.User.CompanyName.ToLower().Contains(search));
        }
        return query;
    }
    protected IQueryable<LoadEntity> Sort(IQueryable<LoadEntity> query, GetLoadListQuery request)
    {
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
        return query;
    }

    protected IQueryable<LoadEntity> Filter(IQueryable<LoadEntity> query, GetLoadListQuery request)
    {
        query = query.Where(l => request.Status == null || l.Status.ToString() == request.Status);
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
        return query;
    }
}