using Application.Common.Mappings;
using Application.CQRS.OrderCQ.Commands.Create;
using Application.CQRS.TruckCQ.Commands.Create;
using AutoMapper;
using Domain.Models.Abstract;
using Domain.Models.Truck;

namespace Application.DTO.Truck;

public record TruckDetailsVm : CreateTruckCommand, IMapWith<TruckEntity>
{
    /// <summary>
    /// Id заказа
    /// </summary>
    public Guid Id { get; init; }
    /// <summary>
    /// Время создания заказа
    /// </summary>
    public DateTime Created { get; init; }
    /// <summary>
    /// Время последнего обновления заказа
    /// </summary>
    public DateTime Updated { get; init; }
    /// <summary>
    /// Приложенные фото
    /// </summary>
    public string[] Photos { get; init; } = [];
    
    public new void Mapping(Profile profile)
    {
        profile.CreateMap<TruckEntity, TruckDetailsVm>().ForMember(dest =>
                dest.Photos, opt =>
                opt.MapFrom(src => src.Photos.Select(p => p.FilePath).ToArray()))
            .ForMember(dest => 
                dest.RoutePoints, opt => 
                opt.MapFrom(src => src.RoutePoints.OrderBy(r => r.OrderIndex)));
        
        profile.CreateMap<RoutePoint<TruckEntity>, RoutePointVm>();
    }
}