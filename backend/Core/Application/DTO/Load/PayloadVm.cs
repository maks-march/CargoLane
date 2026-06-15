using Application.Common.Mappings;
using Domain.Models.Load;
using AutoMapper;

namespace Application.DTO.Load;

public record PayloadVm : IMapWith<Payload>
{
    public double Length { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }
    public double Weight { get; set; }
    public double Volume { get; set; }
    public int Amount { get; init; }
    public string Type { get; init; } = string.Empty;

    public void Mapping(Profile profile)
    {
        profile.CreateMap<Payload, PayloadVm>()
            .ForMember(d => d.Type, opt => opt.MapFrom(s => s.Type.ToString()));
    }
}