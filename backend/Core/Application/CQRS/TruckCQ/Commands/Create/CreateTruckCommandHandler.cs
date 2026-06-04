using Application.Interfaces;
using AutoMapper;
using Domain.Models.Truck;
using MediatR;

namespace Application.CQRS.TruckCQ.Commands.Create;

/// <summary>
/// Обработчик команды создания грузового транспортного средства
/// </summary>
public class CreateTruckCommandHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<CreateTruckCommand, Guid>
{
    public async Task<Guid> Handle(CreateTruckCommand request, CancellationToken cancellationToken)
    {
        // 1. Маппинг команды в сущность
        var truck = mapper.Map<TruckEntity>(request);
        
        // 2. Установка основных идентификаторов и временных меток
        truck.Id = Guid.NewGuid();
        truck.Created = DateTime.UtcNow;
        truck.Updated = DateTime.UtcNow;
        truck.UserId = request.UserId;
        
        // 3. Инициализация коллекций (если они null)
        truck.LoadType ??= [];
        truck.UnloadType ??= [];
        truck.Photos ??= [];
        truck.RoutePoints ??= [];
        
        // 4. Установка значений по умолчанию для обязательных полей
        truck.Vehicles = request.Vehicles > 0 ? request.Vehicles : 1;
        truck.Adr = request.Adr >= 0 ? request.Adr : 0;

        if (!request.IsPaymentRequested)
        {
            truck.ByCash = request.ByCash ?? 0;
            truck.NotTaxedByCard = request.NotTaxedByCard ?? 0;
            truck.TaxedByCard = request.TaxedByCard ?? 0;
        }
        
        // 6. Если есть точки маршрута, инициализируем их (опционально)
        for (var index = 0; index < truck.RoutePoints.Count; index++)
        {
            var point = truck.RoutePoints[index];
            point.Id = Guid.NewGuid();
            point.EntityId = truck.Id;
            point.OrderIndex = index;
        }
        
        // 7. Сохранение в базу данных
        await dbContext.Trucks.AddAsync(truck, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        
        return truck.Id;
    }
}