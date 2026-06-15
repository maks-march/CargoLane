using System.ComponentModel;
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
    
    [DefaultValue("Active")]
    public string Status { get; set; } = string.Empty;
    public double Payment { get; set; }
    public double Insurance { get; set; }
    public string HScode { get; set; } = string.Empty;
    public int Adr { get; set; }
    public string[] VihicleTypes { get; set; } = [];
    public string CargoType { get; set; } = string.Empty;
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
                opt.MapFrom(src => src.RoutePoints))
            .ForMember(dest => dest.TotalWeight, opt => 
                opt.Ignore())
            .ForMember(dest => dest.TotalVolume, opt => 
                opt.Ignore());

        profile.CreateMap<PayloadInputDto, Payload>()
            .ForMember(dest => dest.Type, opt => 
                opt.MapFrom(src => Enum.Parse<PayloadType>(src.Type, true)));
        
        profile.CreateMap<RoutePointInputDto, RoutePoint<LoadEntity>>()
            .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.City))
            .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address))
            .ForMember(dest => dest.ArrivalTime, opt => opt.MapFrom(src => src.ArrivalTime));
    }
}

public record PayloadInputDto
{
    public double Length { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }
    public double Weight { get; set; }
    public int Amount { get; set; }
    
    [DefaultValue("Boxes")]
    public string Type { get; set; } = string.Empty;
}

public record RoutePointInputDto
{
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateTime ArrivalTime { get; set; }
}
