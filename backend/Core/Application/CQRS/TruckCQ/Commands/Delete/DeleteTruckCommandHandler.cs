using Application.Common.Exceptions;
using Application.Interfaces;
using Domain.Models.Truck;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.TruckCQ.Commands.Delete;

/// <summary>
/// Обработчик команды удаления грузового транспортного средства
/// </summary>
public class DeleteTruckCommandHandler(IAppDbContext dbContext) 
    : IRequestHandler<DeleteTruckCommand>
{
    public async Task Handle(DeleteTruckCommand request, CancellationToken cancellationToken)
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
        
        // 2. Находим грузовик для удаления
        var truck = await dbContext.Trucks.FindAsync([request.Id], cancellationToken) 
                    ?? throw new NotFoundException(nameof(TruckEntity), request.Id);
        
        // 3. Удаляем грузовик (связанные данные удалятся каскадно, если настроено в конфигурации)
        dbContext.Trucks.Remove(truck);
        
        // 4. Сохраняем изменения
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}