using Application.Common.Mappings;
using Domain.Models.Load;
using AutoMapper;

namespace Application.DTO.Load;

public record LoadDetailsVm : IMapWith<LoadEntity>
{
    public Guid Id { get; init; }
    public int Article { get; init; }
    public double Payment { get; init; }
    public double Insurance { get; init; }
    public string HScode { get; init; } = string.Empty;
    public int Adr { get; init; }
    public string[] VehicleTypes { get; init; } = [];
    public string CargoType { get; init; } = string.Empty;
    public string About { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public bool IsReviewed { get; init; }
    public double TotalWeight { get; set; }
    public double TotalVolume { get; set; }
    public Guid UserId { get; init; }
    // Вложенные коллекции
    public IList<PayloadVm> Payloads { get; init; } = [];
    public IList<LoadRoutePointVm> RoutePoints { get; init; } = [];
    public IList<string> Files { get; init; } = [];

    public void Mapping(Profile profile)
    {
        profile.CreateMap<LoadEntity, LoadDetailsVm>()
            .ForMember(d => d.Article, opt => opt.MapFrom(s => s.Id.GetHashCode()%1000000))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.Files, opt => opt.MapFrom(s => s.Photos.Select(p => p.FilePath)))
            .ForMember(d => d.RoutePoints, opt => opt.MapFrom(s => s.RoutePoints.OrderBy(rp => rp.OrderIndex)));
    }
}