using Application.Common.Mappings;
using Domain.Models.Load;
using AutoMapper;

namespace Application.DTO.Load;

public record PayloadVm : IMapWith<Payload>
{
    public double Length { get; init; }
    public double Width { get; init; }
    public double Height { get; init; }
    public double Weight { get; init; }
    public double Volume { get; init; }
    public int Amount { get; init; }
    public string Type { get; init; } = string.Empty;

    public void Mapping(Profile profile)
    {
        profile.CreateMap<Payload, PayloadVm>()
            .ForMember(d => d.Type, opt => opt.MapFrom(s => s.Type.ToString()));
    }
}