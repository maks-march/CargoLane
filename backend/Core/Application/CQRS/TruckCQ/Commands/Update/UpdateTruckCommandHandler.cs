using Application.Common.Exceptions;
using Application.CQRS.AbstractHandlers;
using Application.Interfaces;
using AutoMapper;
using Domain.Models.Truck;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.TruckCQ.Commands.Update;

/// <summary>
/// Обработчик команды обновления грузового транспортного средства
/// </summary>
public class UpdateTruckCommandHandler(IAppDbContext dbContext, IMapper mapper) 
    : UpdateCollectionCommandHandler(dbContext, mapper), IRequestHandler<UpdateTruckCommand, Guid>
{
    public async Task<Guid> Handle(UpdateTruckCommand request, CancellationToken cancellationToken)
    {
        // 1. Проверяем существование грузовика и права доступа пользователя
        var truckExists = await dbContext.Trucks
            .AnyAsync(t => t.Id == request.Id && t.UserId == request.UserId, cancellationToken);
        
        if (!truckExists)
        {
            var exists = await dbContext.Trucks.AnyAsync(t => t.Id == request.Id, cancellationToken);
            if (!exists) 
                throw new NotFoundException(nameof(TruckEntity), request.Id);
            throw new ForbiddenException(nameof(TruckEntity), request.UserId);
        }
        
        // 2. Загружаем грузовик со всеми необходимыми навигационными свойствами
        var truck = await dbContext.Trucks
            .Include(t => t.User)
            .Include(t => t.Photos) // Загружаем фото, но не изменяем их
            .FirstAsync(truck => truck.Id == request.Id, cancellationToken);
        
        // 3. Применяем маппинг (обновляются только не-null поля)
        mapper.Map(request, truck);
        
        // 4. Обновляем временную метку
        truck.Updated = DateTime.UtcNow;
        if (request.RoutePoints != null)
        {
            UpdateCollection(truck.RoutePoints, request.RoutePoints, truck);
        }
        // 5. Сохраняем изменения
        await dbContext.SaveChangesAsync(cancellationToken);
        
        return truck.Id;
    }
}