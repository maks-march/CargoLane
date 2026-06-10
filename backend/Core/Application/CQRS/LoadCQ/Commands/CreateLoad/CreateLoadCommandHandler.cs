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
        // 1. Маппим команду в сущность
        var load = mapper.Map<LoadEntity>(request);
        
        // 2. Инициализируем основные поля
        load.Id = Guid.NewGuid();
        load.Created = DateTime.UtcNow;
        load.Updated = DateTime.UtcNow;
        load.IsReviewed = false;

        // 3. Обработка грузов (Payloads)
        for (var i = 0; i < load.Payloads.Count; i++)
        {
            var payload = load.Payloads[i];
            payload.Id = Guid.NewGuid();
            payload.EntityId = load.Id; // Привязка к LoadEntity
            payload.OrderIndex = i;
        }

        // 4. Обработка точек маршрута (RoutePoints)
        if (load.RoutePoints.Count > 0)
        {
            // Помечаем первую точку как точку погрузки
            load.RoutePoints[0].IsLoad = true; 
            
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