using Application.Interfaces;
using AutoMapper;
using Domain.Models.Load;
using MediatR;

namespace Application.CQRS.LoadCQ.Commands.CreateLoad;

public class CreateLoadCommandHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<CreateLoadCommand, Guid>
{
    public async Task<Guid> Handle(CreateLoadCommand request, CancellationToken cancellationToken)
    {
        // 1. Маппим команду в сущность (now safe thanks to the mapping fixes above)
        var load = mapper.Map<LoadEntity>(request);
        
        // 2. Инициализируем основные поля
        load.Id = Guid.NewGuid();
        load.Created = DateTime.UtcNow;
        load.Updated = DateTime.UtcNow;
        load.IsReviewed = false;
        
        double totalVolume = 0.0;
        double totalWeight = 0.0;
        // 3. Обработка грузов (Payloads)
        for (var i = 0; i < load.Payloads.Count; i++)
        {
            var payload = load.Payloads[i];
            payload.Id = Guid.NewGuid();
            payload.EntityId = load.Id; // Привязка к LoadEntity
            payload.OrderIndex = i;
            payload.Volume = payload.Width * payload.Height * payload.Length;
            totalVolume += payload.Volume * payload.Amount;
            totalWeight += payload.Weight * payload.Amount;
        }
        load.TotalVolume = totalVolume;
        load.TotalWeight = totalWeight;
        // 4. Обработка точек маршрута (RoutePoints)
        if (load.RoutePoints.Count > 0)
        {
            for (var i = 0; i < load.RoutePoints.Count; i++)
            {
                var point = load.RoutePoints[i];
                point.Id = Guid.NewGuid();
                point.EntityId = load.Id; // Привязка к LoadEntity
                point.OrderIndex = i;
            }
        }

        // 5. Сохранение в БД
        await dbContext.Loads.AddAsync(load, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return load.Id;
    }
}
