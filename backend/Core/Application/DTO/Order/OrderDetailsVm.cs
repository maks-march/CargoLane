using Application.Common.Mappings;
using Application.CQRS.OrderCQ.Commands.Create;
using AutoMapper;
using Domain.Models.Abstract;
using Domain.Models.Order;

namespace Application.DTO.Order;

public record OrderDetailsVm : CreateOrderCommand, IMapWith<OrderEntity>
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
        profile.CreateMap<OrderEntity, OrderDetailsVm>()
            .ForMember(dest => 
                dest.Status,opt =>
                opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => 
                dest.Photos,opt =>
                opt.MapFrom(src => src.Photos.Select(p => p.FilePath).ToArray()))
            
            // Настраиваем маппинг для вложенных DTO
            .ForMember(dest => 
                dest.Payment, opt => 
                opt.MapFrom(src => src.Payment))
            .ForMember(dest => 
                dest.Transport, opt => 
                opt.MapFrom(src => src.Transport))
            .ForMember(dest => 
                dest.Payloads, opt => 
                opt.MapFrom(src => src.Payloads))
            .ForMember(dest => 
                dest.RoutePoints, opt => 
                opt.MapFrom(src => src.RoutePoints.OrderBy(r => r.OrderIndex)));
            
        // Также нам нужны маппинги для самих DTO в их доменные аналоги
        profile.CreateMap<Payment, PaymentCreateCommand>()
               .ForMember(dest => 
                   dest.PaymentType,opt => 
                   opt.MapFrom(src => src.PaymentType.ToString()));
        
        profile.CreateMap<Transport, TransportCreateCommand>();

       profile.CreateMap<PayloadOrder, PayloadCreateCommand>()
           .ForMember(dest => 
               dest.Wrap,opt => 
               opt.MapFrom(src => src.Wrap.ToString()));

       profile.CreateMap<RoutePoint<OrderEntity>, RoutePointVm>();
    }
}