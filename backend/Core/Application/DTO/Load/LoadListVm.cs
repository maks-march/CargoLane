using Application.Common.Mappings;
using AutoMapper;
using Domain.Models.Load;

namespace Application.DTO.Load;

public record LoadListVm : IMapWith<LoadEntity>
{
    public Guid Id { get; init; }
    public int Article { get; init; }
    public DateTime StartDate { get; set; }
    public double Payment { get; init; }
    
    // Упрощенные данные для карточки в списке
    public string StartCity { get; init; } = string.Empty;
    public string EndCity { get; init; } = string.Empty;
    public double TotalWeight { get; set; }
    public double TotalVolume { get; set; }
    
    public string[] VehicleTypes { get; set; } = [];
    public string CargoType { get; set; } = string.Empty;
    public int PayloadCount { get; init; }
    public string Shipper { get; init; } = string.Empty;
    public DateTime Created { get; set; }
    public string Status { get; init; } = string.Empty;

    public void Mapping(Profile profile)
    {
        profile.CreateMap<LoadEntity, LoadListVm>()
            // Берем города из первой и последней точек маршрута (safe against empty collections)
            .ForMember(d => d.Article, opt => opt.MapFrom(s => s.Article))
            .ForMember(d => d.StartCity, opt => opt.MapFrom(s => 
                s.RoutePoints.Any()
                    ? s.RoutePoints.OrderBy(rp => rp.OrderIndex).First().City 
                    : string.Empty))
            .ForMember(d => d.EndCity, opt => opt.MapFrom(s => 
                s.RoutePoints.Any()
                    ? s.RoutePoints.OrderByDescending(rp => rp.OrderIndex).First().City 
                    : string.Empty))
            .ForMember(d => d.PayloadCount, opt => opt.MapFrom(s => 
                s.Payloads.Select(p => p.Amount).Sum()))
            // Derive StartDate from first RoutePoint's ArrivalTime (common pattern for list cards)
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.StartDate, opt => opt.MapFrom(s => 
                s.RoutePoints.OrderBy(rp => rp.OrderIndex).First().ArrivalTime))
            .ForMember(d => d, opt => 
                opt.MapFrom(src => src.User.CompanyName));
    }
}
