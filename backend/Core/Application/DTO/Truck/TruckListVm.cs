using Application.Common.Mappings;
using AutoMapper;
using Domain.Models.Truck;

namespace Application.DTO.Truck;

public record TruckListVm : IMapWith<TruckEntity>
{
    public Guid Id { get; set; }
    public required string BodyType {get; set;}
    public IList<string> LoadType {get; set;} = [];
    public IList<string> UnloadType {get; set;} = [];
    public bool IsPaymentRequested { get; set; } = false;
    public double MaxPayment { get; set; }
    public double MinPayment { get; set; }
    public string Description {  get; set; } = string.Empty;
    public Domain.Models.User User { get; set; }
    
    /// <summary>
    /// Город отправления (первая точка маршрута)
    /// </summary>
    public string StartCity { get; init; } = string.Empty;

    /// <summary>
    /// Город назначения (последняя точка маршрута)
    /// </summary>
    public string EndCity { get; init; } = string.Empty;

    public void Mapping(Profile profile)
    {
        profile.CreateMap<TruckEntity, TruckListVm>()
            .ForMember(dest =>
                dest.MaxPayment, opt =>
                opt.MapFrom(src =>
                    new[] { src.ByCash, src.NotTaxedByCard, src.TaxedByCard }.Max()))
            .ForMember(dest =>
                dest.MaxPayment, opt =>
                opt.MapFrom(src =>
                    new[] { src.ByCash, src.NotTaxedByCard, src.TaxedByCard }.Min()));
    }
}