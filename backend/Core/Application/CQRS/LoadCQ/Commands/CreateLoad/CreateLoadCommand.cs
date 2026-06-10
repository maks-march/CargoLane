using Application.Common.Mappings;
using AutoMapper;
using Domain.Enums.Load;
using Domain.Models.Abstract;
using Domain.Models.Load;
using MediatR;

namespace Application.CQRS.LoadCQ.Commands.CreateLoad;

public record CreateLoadCommand : IRequest<Guid>, IMapWith<LoadEntity>
{
    public Guid UserId { get; set; } // Из контроллера
    
    public string Status { get; set; }
    public double Payment { get; set; }
    public double Insurance { get; set; }
    public string HScode { get; set; } = string.Empty;
    public int Adr { get; set; }
    public string[] SuitableCargos { get; set; } = [];
    public string About { get; set; } = string.Empty;

    public List<PayloadInputDto> Payloads { get; set; } = [];
    public List<RoutePointInputDto> RoutePoints { get; set; } = [];
    
    public void Mapping(Profile profile)
    {
        profile.CreateMap<CreateLoadCommand, LoadEntity>()
            .ForMember(dest => dest.Status, opt => 
                opt.MapFrom(src => Enum.Parse<LoadStatus>(src.Status)))
            .ForMember(dest => dest.Payloads, opt => 
                opt.MapFrom(src => src.Payloads))
            .ForMember(dest => dest.RoutePoints, opt => 
                opt.MapFrom(src => src.RoutePoints));

        profile.CreateMap<PayloadInputDto, Payload>()
            .ForMember(dest => dest.Type, opt => 
                opt.MapFrom(src => Enum.Parse<PayloadType>(src.Type, true)));

        profile.CreateMap<RoutePointInputDto, RoutePoint<LoadEntity>>();
    }
}

public record PayloadInputDto
{
    public double Length { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }
    public double Weight { get; set; }
    public double Volume { get; set; }
    public int Amount { get; set; }
    public string Type { get; set; } = string.Empty;
}

public record RoutePointInputDto
{
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateTime? ArrivalTime { get; set; }
    public int OrderIndex { get; set; }
}