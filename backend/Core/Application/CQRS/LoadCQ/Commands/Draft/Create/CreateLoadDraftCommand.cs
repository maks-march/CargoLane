using Application.Common.Mappings;
using Application.CQRS.LoadCQ.Commands.CreateLoad;
using AutoMapper;
using Domain.Enums.Load;
using Domain.Models.Abstract;
using Domain.Models.Load;
using MediatR;

namespace Application.CQRS.LoadCQ.Commands.Draft.Create;

public class CreateLoadDraftCommand : IRequest<Guid>, IMapWith<LoadDraft>
{
    public Guid UserId { get; set; }
    public double? Payment { get; set; }
    public double? Insurance { get; set; }
    public string? HScode { get; set; }
    public int? Adr { get; set; }
    public string[]? VehicleTypes { get; set; } = null;
    public string? CargoType { get; set; } = null;
    public string? About { get; set; }
    
    public IList<RoutePointInputDto>? RoutePoints { get; set; } = null;
    public IList<PayloadDraftInputDto>? Payloads { get; set; } = null;
    public void Mapping(Profile profile)
    {
        profile.CreateMap<CreateLoadDraftCommand, LoadDraft>()
            // Игнорируем поля, которые устанавливаются вручную в хендлере
            .ForMember(dest => dest.Id, opt => opt.Ignore())

            // Маппим коллекции (AutoMapper автоматически обработает null, если настроено)
            .ForMember(dest => dest.RoutePoints, opt => opt.MapFrom(src => src.RoutePoints))
            .ForMember(dest => dest.Payloads, opt => opt.MapFrom(src => src.Payloads));
        
        profile.CreateMap<PayloadDraftInputDto, PayloadDraft>()
            .ForMember(dest => dest.Type, opt =>
                {
                    opt.Condition(src => src.Type != null);
                    opt.MapFrom(src => Enum.Parse<PayloadType>(src.Type, true));
                });
        
        profile.CreateMap<RoutePointInputDto, RoutePoint<LoadDraft>>()
            .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.City))
            .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address))
            .ForMember(dest => dest.ArrivalTime, opt => opt.MapFrom(src => src.ArrivalTime));
    }
}

public record PayloadDraftInputDto
{
    public double? Length { get; set; } = null;
    public double? Width { get; set; } = null;
    public double? Height { get; set; } = null;
    public double? Weight { get; set; } = null;
    public int? Amount { get; set; } = null;
    public string? Type { get; set; } = null;
}