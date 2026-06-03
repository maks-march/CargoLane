using System.ComponentModel;
using Application.Common.Mappings;
using Application.CQRS.OrderCQ.Commands.Create;
using Application.DTO.Attributes;
using AutoMapper;
using Domain.Models.Abstract;
using Domain.Models.Truck;
using MediatR;

namespace Application.CQRS.TruckCQ.Commands.Create;

/// <summary>
/// Команда для создания нового грузового транспортного средства (грузовика)
/// </summary>
public record CreateTruckCommand : IRequest<Guid>, IMapWith<TruckEntity>
{
    /// <summary>
    /// Тип кузова (например: тент, рефрижератор, бортовой, самосвал и т.д.)
    /// </summary>
    public string BodyType { get; set; } = string.Empty;

    /// <summary>
    /// Тип(ы) погрузки (например: задняя, боковая, верхняя, гидравлическая и т.д.)
    /// </summary>
    public IList<string> LoadType { get; set; } = [];

    /// <summary>
    /// Тип(ы) выгрузки/разгрузки (например: задняя, боковая, самосвальная и т.д.)
    /// </summary>
    public IList<string> UnloadType { get; set; } = [];

    /// <summary>
    /// Количество транспортных средств в заявке
    /// </summary>
    [DefaultValue(1)]
    public int Vehicles { get; set; } = 1;

    /// <summary>
    /// Минимальная температура перевозки (для рефрижераторов)
    /// Может быть null, если температурный режим не требуется
    /// </summary>
    public int? TemperatureFrom { get; set; }

    /// <summary>
    /// Максимальная температура перевозки (для рефрижераторов)
    /// Может быть null, если температурный режим не требуется
    /// </summary>
    public int? TemperatureTo { get; set; }

    /// <summary>
    /// Признак того, что экипаж укомплектован полностью
    /// </summary>
    public bool IsCrewFull { get; set; }

    /// <summary>
    /// Класс опасности ADR (ДОПОГ - Европейское соглашение о международной дорожной перевозке опасных грузов)
    /// 0 - не опасный груз, 1-9 - классы опасности
    /// </summary>
    public int Adr { get; set; }

    /// <summary>
    /// Наличие сцепки (тягач с полуприцепом)
    /// </summary>
    public bool IsHitch { get; set; }

    /// <summary>
    /// Наличие пневматической подвески
    /// </summary>
    public bool IsPneumaticVehicle { get; set; }

    /// <summary>
    /// Наличие стоек/отбортовки для перевозки длинномерных грузов
    /// </summary>
    public bool IsStakes { get; set; }

    /// <summary>
    /// Наличие свидетельства TIR (Карнет TIR - международная таможенная транзитная система)
    /// </summary>
    public bool IsTir { get; set; }

    /// <summary>
    /// Наличие документа T1 (таможенный транзитный документ для стран, не входящих в ЕС)
    /// </summary>
    public bool IsT1 { get; set; }

    /// <summary>
    /// Наличие CMR-накладной (международная товарно-транспортная накладная)
    /// </summary>
    public bool IsCmr { get; set; }

    /// <summary>
    /// Наличие медицинской книжки/санитарной книжки у водителя
    /// </summary>
    public bool IsMedicalBook { get; set; }

    /// <summary>
    /// Запрошена ли предоплата за перевозку
    /// </summary>
    [DefaultValue(true)]
    public bool IsPaymentRequested { get; set; } = true;

    /// <summary>
    /// Сумма оплаты, облагаемая налогом и оплачиваемая картой
    /// </summary>
    public double TaxedByCard { get; set; }

    /// <summary>
    /// Сумма оплаты, не облагаемая налогом и оплачиваемая картой
    /// </summary>
    public double NotTaxedByCard { get; set; }

    /// <summary>
    /// Сумма оплаты наличными деньгами
    /// </summary>
    public double ByCash { get; set; }

    /// <summary>
    /// Идентификатор пользователя, создающего грузовик
    /// </summary>
    public Guid UserId { get; set; } = Guid.Empty;
    
    /// <summary>
    /// Дополнительное описание
    /// </summary>
    public string Description = string.Empty;
    
    /// <summary>
    /// Коллекция точек маршрута
    /// </summary>
    [SwaggerJsonDefault(typeof(RoutePointVm), 2)]
    public IList<RoutePointVm> RoutePoints { get; init; } = [new (), new()];

    public void Mapping(Profile profile)
    {
        profile.CreateMap<CreateTruckCommand, TruckEntity>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Created, opt => opt.Ignore())
            .ForMember(dest => dest.Updated, opt => opt.Ignore())
            .ForMember(dest => dest.Photos, opt => opt.Ignore());
        profile.CreateMap<RoutePointVm, RoutePoint<TruckEntity>>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.OrderIndex, opt => opt.Ignore())
            .ForMember(dest => dest.EntityId, opt => opt.Ignore());
    }
}