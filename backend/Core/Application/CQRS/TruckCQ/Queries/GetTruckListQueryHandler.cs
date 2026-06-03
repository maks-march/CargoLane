using System.Linq.Expressions;
using Application.Interfaces;
using Application.DTO.Truck;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain.Models.Truck;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.TruckCQ.Queries;

public class GetTruckListQueryHandler(
    IAppDbContext dbContext, 
    IMapper mapper) : IRequestHandler<GetTruckListQuery, TruckListVm[]>
{
    public async Task<TruckListVm[]> Handle(GetTruckListQuery request, CancellationToken cancellationToken)
    {
        var query = dbContext.Trucks.AsNoTracking();

        // if (!string.IsNullOrWhiteSpace(request.SearchWord))
        // {
        //     query = query.Where(t => t.BodyType.Contains(request.SearchWord, StringComparison.OrdinalIgnoreCase));
        // }

        if (!string.IsNullOrWhiteSpace(request.BodyType))
        {
            query = query.Where(t => t.BodyType.Contains(request.BodyType, StringComparison.OrdinalIgnoreCase));
        }

        if (request.PriceFrom.HasValue)
        {
            var pf = request.PriceFrom.Value;
            query = query.Where(t => t.ByCash >= pf || t.TaxedByCard >= pf || t.NotTaxedByCard >= pf);
        }

        if (request.PriceTo.HasValue)
        {
            var pt = request.PriceTo.Value;
            query = query.Where(t => t.ByCash <= pt || t.TaxedByCard <= pt || t.NotTaxedByCard <= pt);
        }

        var columnsMap = new Dictionary<string, Expression<Func<TruckEntity, object>>>
        {
            ["date"] = t => t.Created, 
            ["specnumber"] = t => t.Id, 
            ["weight"] = t => t.Vehicles, 
            ["cost"] = t => Math.Min(Math.Min(t.TaxedByCard, t.NotTaxedByCard), t.ByCash)
        };

        var sortByColumn = request.SortBy?.ToLowerInvariant();

        if (!string.IsNullOrWhiteSpace(sortByColumn) && columnsMap.ContainsKey(sortByColumn))
        {
            query = request.IsAscending 
                ? query.OrderBy(columnsMap[sortByColumn])
                : query.OrderByDescending(columnsMap[sortByColumn]);
        }
        else
        {
            query = query.OrderByDescending(t => t.Id);
        }

        return await query
            .ProjectTo<TruckListVm>(mapper.ConfigurationProvider)
            .ToArrayAsync(cancellationToken);
    }
}