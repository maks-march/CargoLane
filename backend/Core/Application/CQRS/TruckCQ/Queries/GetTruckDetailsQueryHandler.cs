using Application.Common.Exceptions;
using Application.DTO.Truck;
using Application.Interfaces;
using AutoMapper;
using Domain.Models.Truck;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.TruckCQ.Queries;

public class GetTruckDetailsQueryHandler(
    IAppDbContext dbContext, 
    IMapper mapper) : IRequestHandler<GetTruckDetailsQuery, TruckDetailsVm>
{
    public async Task<TruckDetailsVm> Handle(GetTruckDetailsQuery request, CancellationToken cancellationToken)
    {
        // Загружаем сущность со всеми необходимыми связями
        var truck = await dbContext.Trucks
            .Include(t => t.Photos
                .OrderBy(p => p.OrderIndex))
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        // Проверка на существование
        if (truck == null)
        {
            throw new NotFoundException(nameof(TruckEntity), request.Id);
        }

        // Маппим в вью-модель
        return mapper.Map<TruckDetailsVm>(truck);
    }
}