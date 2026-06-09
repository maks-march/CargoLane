using Application.Common.Mappings;
using Domain.Models.Load;
using AutoMapper;

namespace Application.DTO.Load;

public record LoadDraftVm : IMapWith<LoadDraft>
{
    public Guid Id { get; init; }
    public DateOnly? StartDate { get; init; }
    public double? Payment { get; init; }
    public double? Insurance { get; init; }
    public string? HScode { get; init; }
    public int? Adr { get; init; }
    public string[]? SuitableCargos { get; init; }
    public string? About { get; init; }
    
    public List<PayloadDraftVm> Payloads { get; init; } = [];
    public List<RoutePointDraftVm> RoutePoints { get; init; } = [];

    public void Mapping(Profile profile)
    {
        profile.CreateMap<LoadDraft, LoadDraftVm>();
    }
}

public record PayloadDraftVm
{
    public double? Length { get; init; }
    public double? Width { get; init; }
    public double? Height { get; init; }
    public double? Weight { get; init; }
    public double? Volume { get; init; }
    public int? Amount { get; init; }
    public string? Type { get; init; }
}

public record RoutePointDraftVm
{
    public string? City { get; init; }
    public string? Address { get; init; }
    public DateTime? ArrivalTime { get; init; }
    public int? OrderIndex { get; init; }
}