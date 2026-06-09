using System.ComponentModel;
using Application.Common.Mappings;
using AutoMapper;
using Domain.Enums;
using Domain.Models.Abstract;
using Domain.Models.Order;
using MediatR;

namespace Application.CQRS.OrderCQ.Commands.Update;

/// <summary>
/// Команда для обновления существующего заказа
/// </summary>
public record UpdateOrderCommand : IRequest<Guid>, IMapWith<OrderEntity>
{
    /// <summary>
    /// Идентификатор обновляемого заказа
    /// </summary>
    [DefaultValue("")]
    public Guid Id { get; set; }
    
    [DefaultValue("")]
    public Guid UserId { get; set; } = Guid.Empty;

    /// <summary>
    /// Дата начала выполнения заказа
    /// </summary>
    public DateOnly? StartDate { get; init; } = null;

    /// <summary>
    /// Статус заказа
    /// </summary>
    public string? Status { get; init; } = null;

    /// <summary>
    /// Дополнительная информация о заказе
    /// </summary>
    public string? About { get; init; } = null;
    
    /// <summary>
    /// Номер спецификации
    /// </summary>
    public int? SpecNumber { get; init; } = null;

    /// <summary>
    /// Информация об оплате
    /// </summary>
    public PaymentUpdateCommand? Payment { get; init; } = null;

    /// <summary>
    /// Информация о транспорте
    /// </summary>
    public TransportUpdateCommand? Transport { get; init; } = null;

    /// <summary>
    /// Коллекция грузов
    /// </summary>
    public IList<PayloadUpdateCommand>? Payloads { get; init; } = null;

    /// <summary>
    /// Коллекция точек маршрута
    /// </summary>
    public IList<RoutePointUpdateCommand>? RoutePoints { get; init; } = null;

    public void Mapping(Profile profile)
    {
        profile.CreateMap<UpdateOrderCommand, OrderEntity>()
            .ForMember(dest =>
                dest.Id, opt =>
                opt.Ignore())
            .ForMember(dest =>
                dest.UserId, opt =>
                opt.Ignore())
            .ForMember(dest =>
                dest.User, opt =>
                opt.Ignore())
            .ForMember(dest =>
                    dest.About,
                opt =>
                    opt.Condition(src => src.Payment != null))
            .ForMember(dest =>
                dest.StartDate, opt =>
                opt.Condition(src => src.StartDate != null))
            .ForMember(dest =>
                    dest.SpecNumber,
                opt =>
                    opt.Condition(src => src.Payment != null))
            .ForMember(dest =>
                    dest.Status, opt =>
                {
                    opt.Condition(src => src.Status != null);
                    opt.MapFrom(src => Enum.Parse<OrderStatus>(src.Status!));
                }
            )
            .ForMember(dest =>
                    dest.Photos,
                opt =>
                    opt.Ignore())
            .ForMember(dest =>
                    dest.Payment,
                opt =>
                    opt.Ignore())
            .ForMember(dest =>
                    dest.Transport,
                opt =>
                    opt.Ignore())
            .ForMember(dest =>
                    dest.Payloads,
                opt =>
                    opt.Ignore())
            .ForMember(dest =>
                    dest.RoutePoints,
                opt =>
                    opt.Ignore());
        
        profile.CreateMap<PaymentUpdateCommand, Payment>()
            .ForMember(dest => dest.PaymentType, opt =>
            {
                opt.Condition(src => src.PaymentType != null);
                opt.MapFrom(src => Enum.Parse<PaymentType>(src.PaymentType!));
            })
            .ForAllMembers(opts => 
                opts.Condition((src, dest, srcMember) => 
                    srcMember != null && src != null));
        
        profile.CreateMap<TransportUpdateCommand, Transport>()
            .ForAllMembers(opts => 
                opts.Condition((src, dest, srcMember) => 
                    srcMember != null && src != null));
        
        profile.CreateMap<PayloadUpdateCommand, PayloadOrder>()
            .ForMember(dest => dest.Wrap, opt =>
            {
                opt.Condition(src => src.Wrap != null);
                opt.MapFrom(src => Enum.Parse<Wrap>(src.Wrap!));
            })
            .ForAllMembers(opts => 
                opts.Condition((src, dest, srcMember) => 
                    srcMember != null && src != null));
        
        profile.CreateMap<RoutePointUpdateCommand, RoutePoint<OrderEntity>>()
            .ForAllMembers(opts => 
                opts.Condition((src, dest, srcMember) => 
                    srcMember != null && src != null));
    }
}

#region inner dto

/// <summary>
/// DTO с информацией об оплате
/// </summary>
public record PaymentUpdateCommand
{
    /// <summary>
    /// Тип оплаты
    /// </summary>
    public string? PaymentType { get; init; } = null;
    
    /// <summary>
    /// Флаг оплаты налогооблагаемой картой
    /// </summary>
    public bool? IsTaxedByCard { get; init; } = null;

    /// <summary>
    /// Флаг оплаты не налогооблагаемой картой
    /// </summary>
    public bool? IsNotTaxedByCard { get; init; } = null;

    /// <summary>
    /// Флаг оплаты наличными
    /// </summary>
    public bool? IsByCash { get; init; } = null;

    /// <summary>
    /// Сумма оплаты налогооблагаемой картой
    /// </summary>
    public double? TaxedByCard { get; init; } = null;

    /// <summary>
    /// Сумма оплаты не налогооблагаемой картой
    /// </summary>
    public double? NotTaxedByCard { get; init; } = null;

    /// <summary>
    /// Сумма оплаты наличными
    /// </summary>
    public double? ByCash { get; init; } = null;

    /// <summary>
    /// Флаг видимости условий оплаты
    /// </summary>
    public bool? IsVisible { get; init; } = null;

    /// <summary>
    /// Количество дней отсрочки платежа
    /// </summary>
    public int? PaymentAfterDays { get; init; } = null;

    /// <summary>
    /// Сумма предоплаты
    /// </summary>
    public double? Prepayment { get; init; } = null;

    /// <summary>
    /// Флаг предоплаты топливом
    /// </summary>
    public bool? IsPrepaymentByFuel { get; init; } = null;
}

/// <summary>
/// DTO с информацией о грузе
/// </summary>
public record PayloadUpdateCommand
{
    /// <summary>
    /// Наименование груза
    /// </summary>
    public string? Name { get; init; } = null;

    /// <summary>
    /// Вес груза
    /// </summary>
    public double? Weight { get; init; } = null;

    /// <summary>
    /// Объем груза
    /// </summary>
    public double? Volume { get; init; } = null;
    
    /// <summary>
    /// Количество грузовых мест
    /// </summary>
    public int? Amount { get; init; } = null;
    
    /// <summary>
    /// Тип упаковки груза
    /// </summary>
    public string? Wrap { get; init; } = null;
}

/// <summary>
/// DTO с информацией о точке маршрута
/// </summary>
public record RoutePointUpdateCommand
{
    /// <summary>
    /// Город точки маршрута
    /// </summary>
    public string? City { get; init; } = null;

    /// <summary>
    /// Адрес точки маршрута
    /// </summary>
    public string? Address { get; init; } = null;
    
    /// <summary>
    /// Время начала загрузки/разгрузки
    /// </summary>
    [DefaultValue("00:00:00")]
    public TimeSpan? LoadTimeStart { get; init; } = null;
    
    /// <summary>
    /// Время окончания загрузки/разгрузки
    /// </summary>
    [DefaultValue("00:00:00")]
    public TimeSpan? LoadTimeEnd { get; init; } = null;

    /// <summary>
    /// Дата прибытия в точку маршрута
    /// </summary>
    public DateOnly? Date { get; init; } = null;

    /// <summary>
    /// Флаг, является ли точка погрузочной
    /// </summary>
    public bool? IsLoad { get; init; } = null;
}

/// <summary>
/// DTO с информацией о транспорте
/// </summary>
public record TransportUpdateCommand
{
    /// <summary>
    /// Тип кузова транспортного средства
    /// </summary>
    public IList<string>? BodyType { get; init; } = null;

    /// <summary>
    /// Тип погрузки
    /// </summary>
    public IList<string>? LoadType { get; init; } = null;

    /// <summary>
    /// Тип разгрузки
    /// </summary>
    public IList<string>? UnloadType { get; init; } = null;
    
    /// <summary>
    /// Количество транспортных средств
    /// </summary>
    public int? Vehicles { get; init; } = null;

    /// <summary>
    /// Нижняя граница температурного режима
    /// </summary>
    public int? TemperatureFrom { get; init; } = null;

    /// <summary>
    /// Верхняя граница температурного режима
    /// </summary>
    public int? TemperatureTo { get; init; } = null;

    /// <summary>
    /// Флаг наличия полной бригады
    /// </summary>
    public bool? IsCrewFull { get; init; } = null;
    
    /// <summary>
    /// Класс опасности ADR
    /// </summary>
    public int? Adr { get; init; } = null;

    /// <summary>
    /// Флаг возможности сцепки
    /// </summary>
    public bool? IsHitch { get; init; } = null;

    /// <summary>
    /// Флаг пневматического транспортного средства
    /// </summary>
    public bool? IsPneumaticVehicle { get; init; } = null;

    /// <summary>
    /// Флаг наличия стоек
    /// </summary>
    public bool? IsStakes { get; init; } = null;

    /// <summary>
    /// Флаг наличия TIR (международная перевозка)
    /// </summary>
    public bool? IsTir { get; init; } = null;

    /// <summary>
    /// Флаг наличия T1 (транзитная декларация)
    /// </summary>
    public bool? IsT1 { get; init; } = null;

    /// <summary>
    /// Флаг наличия CMR (международная транспортная накладная)
    /// </summary>
    public bool? IsCmr { get; init; } = null;

    /// <summary>
    /// Флаг наличия медицинской книжки
    /// </summary>
    public bool? IsMedicalBook { get; init; } = null;
}

#endregion