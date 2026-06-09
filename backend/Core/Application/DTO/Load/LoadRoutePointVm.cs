using Application.Common.Mappings;
using AutoMapper;
using Domain.Models.Abstract;
using Domain.Models.Load;

namespace Application.DTO.Load;

public record LoadRoutePointVm : IMapWith<RoutePoint<LoadEntity>>
{
    public string City { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public DateTime? ArrivalTime { get; init; }
    public int OrderIndex { get; init; }

    public void Mapping(Profile profile)
    {
        profile.CreateMap<RoutePoint<LoadEntity>, LoadRoutePointVm>()
            .ForMember(dest => 
                dest.ArrivalTime, opt => 
                opt.MapFrom(src => src.ArrivalTime));
    }
}