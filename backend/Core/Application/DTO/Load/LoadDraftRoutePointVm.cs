using Application.Common.Mappings;
using AutoMapper;
using Domain.Models.Abstract;
using Domain.Models.Load;

namespace Application.DTO.Load;

public record LoadDraftRoutePointVm : IMapWith<RoutePoint<LoadDraft>>
{
    public string City { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public DateTime ArrivalTime { get; set; }
    public int OrderIndex { get; init; }

    public void Mapping(Profile profile)
    {
        profile.CreateMap<RoutePoint<LoadDraft>, LoadRoutePointVm>()
            .ForMember(dest => 
                dest.ArrivalTime, opt => 
                opt.MapFrom(src => src.ArrivalTime));
    }
}