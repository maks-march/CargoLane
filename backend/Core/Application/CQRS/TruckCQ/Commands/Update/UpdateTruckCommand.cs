using System.ComponentModel;
using Application.Common.Mappings;
using Application.CQRS.OrderCQ.Commands.Update;
using AutoMapper;
using Domain.Models.Abstract;
using Domain.Models.Truck;
using MediatR;

namespace Application.CQRS.TruckCQ.Commands.Update;

/// <summary>
/// Команда для частичного обновления существующего грузового транспортного средства
/// Все поля nullable, обновляются только те, которые были явно переданы
/// </summary>
public record UpdateTruckCommand : IRequest<Guid>, IMapWith<TruckEntity>
{
    /// <summary>
    /// Идентификатор обновляемого грузовика
    /// </summary>
    [DefaultValue("")]
    public Guid Id { get; set; }
    
    /// <summary>
    /// Идентификатор пользователя, выполняющего обновление
    /// </summary>
    [DefaultValue("")]
    public Guid UserId { get; set; } = Guid.Empty;

    /// <summary>
    /// Тип кузова (например: тент, рефрижератор, бортовой, самосвал и т.д.)
    /// </summary>
    public string? BodyType { get; set; }

    /// <summary>
    /// Тип(ы) погрузки (например: задняя, боковая, верхняя, гидравлическая и т.д.)
    /// </summary>
    public IList<string>? LoadType { get; set; }

    /// <summary>
    /// Тип(ы) выгрузки/разгрузки (например: задняя, боковая, самосвальная и т.д.)
    /// </summary>
    public IList<string>? UnloadType { get; set; }

    /// <summary>
    /// Количество транспортных средств в заявке
    /// </summary>
    public int? Vehicles { get; set; }

    /// <summary>
    /// Минимальная температура перевозки (для рефрижераторов)
    /// </summary>
    public int? TemperatureFrom { get; set; }

    /// <summary>
    /// Максимальная температура перевозки (для рефрижераторов)
    /// </summary>
    public int? TemperatureTo { get; set; }

    /// <summary>
    /// Признак того, что экипаж укомплектован полностью
    /// </summary>
    public bool? IsCrewFull { get; set; }

    /// <summary>
    /// Класс опасности ADR (ДОПОГ - Европейское соглашение о международной дорожной перевозке опасных грузов)
    /// 0 - не опасный груз, 1-9 - классы опасности
    /// </summary>
    public int? Adr { get; set; }

    /// <summary>
    /// Наличие сцепки (тягач с полуприцепом)
    /// </summary>
    public bool? IsHitch { get; set; }

    /// <summary>
    /// Наличие пневматической подвески
    /// </summary>
    public bool? IsPneumaticVehicle { get; set; }

    /// <summary>
    /// Наличие стоек/отбортовки для перевозки длинномерных грузов
    /// </summary>
    public bool? IsStakes { get; set; }

    /// <summary>
    /// Наличие свидетельства TIR (Карнет TIR - международная таможенная транзитная система)
    /// </summary>
    public bool? IsTir { get; set; }

    /// <summary>
    /// Наличие документа T1 (таможенный транзитный документ для стран, не входящих в ЕС)
    /// </summary>
    public bool? IsT1 { get; set; }

    /// <summary>
    /// Наличие CMR-накладной (международная товарно-транспортная накладная)
    /// </summary>
    public bool? IsCmr { get; set; }

    /// <summary>
    /// Наличие медицинской книжки/санитарной книжки у водителя
    /// </summary>
    public bool? IsMedicalBook { get; set; }

    /// <summary>
    /// Сумма оплаты, облагаемая налогом и оплачиваемая картой
    /// </summary>
    public double? TaxedByCard { get; set; }

    /// <summary>
    /// Сумма оплаты, не облагаемая налогом и оплачиваемая картой
    /// </summary>
    public double? NotTaxedByCard { get; set; }

    /// <summary>
    /// Сумма оплаты наличными деньгами
    /// </summary>
    public double? ByCash { get; set; }

    /// <summary>
    /// Описание/дополнительная информация о грузовике
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// Коллекция точек маршрута
    /// </summary>
    public IList<RoutePointUpdateCommand>? RoutePoints { get; init; } = null;
    
    public void Mapping(Profile profile)
    {
        profile.CreateMap<UpdateTruckCommand, TruckEntity>()
            // Игнорируем Id - он берется из запроса отдельно
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            // Игнорируем UserId - он берется из запроса отдельно или устанавливается в обработчике
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            // Фото не трогаем - они обновляются отдельным запросом
            .ForMember(dest => dest.Photos, opt => opt.Ignore())
            // Точки маршрута не обновляются через эту команду
            .ForMember(dest => dest.RoutePoints, opt => opt.Ignore())
            
            // Условное обновление: только если значение не null
            .ForMember(dest => dest.BodyType, opt =>
            {
                opt.Condition(src => src.BodyType != null);
            })
            .ForMember(dest => dest.LoadType, opt =>
            {
                opt.Condition(src => src.LoadType != null);
            })
            .ForMember(dest => dest.UnloadType, opt =>
            {
                opt.Condition(src => src.UnloadType != null);
            })
            .ForMember(dest => dest.Vehicles, opt =>
            {
                opt.Condition(src => src.Vehicles.HasValue);
            })
            .ForMember(dest => dest.TemperatureFrom, opt =>
            {
                opt.Condition(src => src.TemperatureFrom.HasValue);
            })
            .ForMember(dest => dest.TemperatureTo, opt =>
            {
                opt.Condition(src => src.TemperatureTo.HasValue);
            })
            .ForMember(dest => dest.IsCrewFull, opt =>
            {
                opt.Condition(src => src.IsCrewFull.HasValue);
            })
            .ForMember(dest => dest.Adr, opt =>
            {
                opt.Condition(src => src.Adr.HasValue);
            })
            .ForMember(dest => dest.IsHitch, opt =>
            {
                opt.Condition(src => src.IsHitch.HasValue);
            })
            .ForMember(dest => dest.IsPneumaticVehicle, opt =>
            {
                opt.Condition(src => src.IsPneumaticVehicle.HasValue);
            })
            .ForMember(dest => dest.IsStakes, opt =>
            {
                opt.Condition(src => src.IsStakes.HasValue);
                opt.MapFrom(src => src.IsStakes!.Value);
            })
            .ForMember(dest => dest.IsTir, opt =>
            {
                opt.Condition(src => src.IsTir.HasValue);
                opt.MapFrom(src => src.IsTir!.Value);
            })
            .ForMember(dest => dest.IsT1, opt =>
            {
                opt.Condition(src => src.IsT1.HasValue);
                opt.MapFrom(src => src.IsT1!.Value);
            })
            .ForMember(dest => dest.IsCmr, opt =>
            {
                opt.Condition(src => src.IsCmr.HasValue);
                opt.MapFrom(src => src.IsCmr!.Value);
            })
            .ForMember(dest => dest.IsMedicalBook, opt =>
            {
                opt.Condition(src => src.IsMedicalBook.HasValue);
                opt.MapFrom(src => src.IsMedicalBook!.Value);
            })
            .ForMember(dest => dest.TaxedByCard, opt =>
            {
                opt.Condition(src => src.TaxedByCard.HasValue);
                opt.MapFrom(src => src.TaxedByCard!.Value);
            })
            .ForMember(dest => dest.NotTaxedByCard, opt =>
            {
                opt.Condition(src => src.NotTaxedByCard.HasValue);
                opt.MapFrom(src => src.NotTaxedByCard!.Value);
            })
            .ForMember(dest => dest.ByCash, opt =>
            {
                opt.Condition(src => src.ByCash.HasValue);
                opt.MapFrom(src => src.ByCash!.Value);
            })
            .ForMember(dest => dest.Description, opt =>
            {
                opt.Condition(src => src.Description != null);
                opt.MapFrom(src => src.Description!);
            });
        
        profile.CreateMap<RoutePointUpdateCommand, RoutePoint<TruckEntity>>()
            .ForAllMembers(opts => 
                opts.Condition((src, dest, srcMember) => 
                    srcMember != null && src != null));
    }
}