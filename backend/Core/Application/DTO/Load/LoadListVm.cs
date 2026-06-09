using Application.Common.Mappings;
using AutoMapper;
using Domain.Models.Load;

namespace Application.DTO.Load;

public record LoadListVm : IMapWith<LoadEntity>
{
    public Guid Id { get; init; }
    public string StartDate { get; init; } = string.Empty;
    public double Payment { get; init; }
    
    // Упрощенные данные для карточки в списке
    public string StartCity { get; init; } = string.Empty;
    public string EndCity { get; init; } = string.Empty;
    public double TotalWeight { get; init; }
    public int PayloadCount { get; init; }

    public void Mapping(Profile profile)
    {
        profile.CreateMap<LoadEntity, LoadListVm>()
            // Берем города из первой и последней точек маршрута
            .ForMember(d => d.StartCity, opt => opt.MapFrom(s => 
                s.RoutePoints.OrderBy(rp => rp.OrderIndex).FirstOrDefault().City))
            .ForMember(d => d.EndCity, opt => opt.MapFrom(s => 
                s.RoutePoints.OrderByDescending(rp => rp.OrderIndex).FirstOrDefault().City))
            // Агрегируем данные по грузам
            .ForMember(d => d.TotalWeight, opt => opt.MapFrom(s => s.Payloads.Sum(p => p.Weight * p.Amount)))
            .ForMember(d => d.PayloadCount, opt => opt.MapFrom(s => s.Payloads.Count));
    }
}