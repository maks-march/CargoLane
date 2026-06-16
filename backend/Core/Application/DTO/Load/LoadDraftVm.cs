using Application.Common.Mappings;
using Domain.Models.Load;
using AutoMapper;

namespace Application.DTO.Load;

public record LoadDraftVm : IMapWith<LoadDraft>
{
    public Guid Id { get; init; }
    public double? Payment { get; init; }
    public double? Insurance { get; init; }
    public string? HScode { get; init; }
    public int? Adr { get; init; }
    public string[]? VehicleTypes { get; init; }
    public string? CargoType { get; init; }
    public string? About { get; init; }
    
    public List<PayloadDraftVm> Payloads { get; init; } = [];
    public List<LoadRoutePointVm> RoutePoints { get; init; } = [];

    public void Mapping(Profile profile)
    {
        profile.CreateMap<LoadDraft, LoadDraftVm>()
            .ForMember(d => d.Payloads, opt => opt.MapFrom(s => s.Payloads))
            .ForMember(d => d.RoutePoints, opt => opt.MapFrom(s => s.RoutePoints));
        profile.CreateMap<PayloadDraft, PayloadDraftVm>()
            .ForMember(d => d.Type, opt =>
            {
                opt.Condition(s => s.Type != null);
                opt.MapFrom(s => s.Type.ToString());
            });
    }
}

public record PayloadDraftVm
{
    public double? Length { get; set; }
    public double? Width { get; set; }
    public double? Height { get; set; }
    public double? Weight { get; set; }
    public double? Volume { get; set; }
    public int? Amount { get; set; }
    public string? Type { get; set; }
}