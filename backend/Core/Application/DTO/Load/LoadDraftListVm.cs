using Application.Common.Mappings;
using AutoMapper;
using Domain.Models.Load;

namespace Application.DTO.Load;

public record LoadDraftListVm : IMapWith<LoadEntity>
{
    public Guid Id { get; init; }
    public DateTime? StartDate { get; set; } = null;
    public double? Payment { get; init; } = null;
    
    // Упрощенные данные для карточки в списке
    public string? StartCity { get; init; } = null;
    public string? EndCity { get; init; } = null;
    
    public string[]? VehicleTypes { get; set; } = [];
    public string? CargoType { get; set; } = null;
    public int? PayloadCount { get; init; }

    public void Mapping(Profile profile)
    {
        profile.CreateMap<LoadDraft, LoadDraftListVm>()
            // Проверка: RoutePoints не null и в нем есть элементы
            .ForMember(d => d.StartCity, opt => opt.MapFrom(s => 
                (s.RoutePoints != null && s.RoutePoints.Any())
                    ? s.RoutePoints.OrderBy(rp => rp.OrderIndex).First().City 
                    : null))
            
            .ForMember(d => d.EndCity, opt => opt.MapFrom(s => 
                (s.RoutePoints != null && s.RoutePoints.Any())
                    ? s.RoutePoints.OrderByDescending(rp => rp.OrderIndex).First().City 
                    : null))
            
            // Проверка: Payloads не null. Если null -> возвращаем null
            .ForMember(d => d.PayloadCount, opt => opt.MapFrom(s => 
                s.Payloads != null 
                    ? s.Payloads.Sum(p => p.Amount ?? 0) 
                    : (int?)null))
            
            // Проверка: Дата из первой точки маршрута
            .ForMember(d => d.StartDate, opt => opt.MapFrom(s => 
                (s.RoutePoints != null && s.RoutePoints.Any())
                    ? s.RoutePoints.OrderBy(rp => rp.OrderIndex).First().ArrivalTime 
                    : (DateTime?)null));
    }
}
