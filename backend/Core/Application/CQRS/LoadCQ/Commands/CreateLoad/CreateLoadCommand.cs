using System.ComponentModel;
using Application.Common.Mappings;
using Application.DTO.Attributes;
using AutoMapper;
using Domain.Models.Abstract;
using Domain.Models.Load;
using MediatR;

namespace Application.CQRS.LoadCQ.Commands.CreateLoad;

public record CreateLoadCommand : IRequest<Guid>, IMapWith<LoadEntity>
{
    public Guid UserId { get; set; } = Guid.Empty;
    
    [DefaultValue("1")]
    public double Payment { get; set; }
    public double Insurance { get; set; }
    public string HScode { get; set; } = string.Empty;
    
    [DefaultValue(3)]
    public int Adr { get; set; }
    
    // [SwaggerJsonDefault(typeof(string), 2)]
    [DefaultValue(new [] { "string" })]
    public string[] VehicleTypes { get; set; } = [];
    
    [DefaultValue("cargo")]
    public string CargoType { get; set; } = string.Empty;
    public string About { get; set; } = string.Empty;
    
    [DefaultValue("1")]
    public double Distance { get; set; } = 0;
    
    [DefaultValue("00:00:00")]
    public string Duration { get; set; } = "00:00:00";
    public List<PayloadInputDto> Payloads { get; set; } = [];
    [SwaggerJsonDefault(typeof(RoutePointInputDto), 2)]
    public List<RoutePointInputDto> RoutePoints { get; set; } = [];
    
    public void Mapping(Profile profile)
    {
        profile.CreateMap<CreateLoadCommand, LoadEntity>()
            .ForMember(dest => dest.Payloads, opt => 
                opt.MapFrom(src => src.Payloads))
            .ForMember(dest => dest.RoutePoints, opt => 
                opt.MapFrom(src => src.RoutePoints))
            .ForMember(dest => dest.TotalWeight, opt => 
                opt.Ignore())
            .ForMember(dest => dest.TotalVolume, opt => 
                opt.Ignore());

        profile.CreateMap<PayloadInputDto, Payload>();
            // .ForMember(dest => dest.Type, opt => 
            //     opt.MapFrom(src => Enum.Parse<PayloadType>(src.Type, true)));
        
        profile.CreateMap<RoutePointInputDto, RoutePoint<LoadEntity>>()
            .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.City))
            .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address))
            .ForMember(dest => dest.ArrivalTime, opt => opt.MapFrom(src => src.ArrivalTime));
    }
}

public record PayloadInputDto
{
    [DefaultValue(1)]
    public double Length { get; set; }
    [DefaultValue(1)]
    public double Width { get; set; }
    [DefaultValue(1)]
    public double Height { get; set; }
    [DefaultValue(1)]
    public double Weight { get; set; }
    [DefaultValue(1)]
    public int Amount { get; set; }
    
    [DefaultValue("Boxes")]
    public string Type { get; set; } = string.Empty;
}

public record RoutePointInputDto
{
    [DefaultValue("string")]
    public string City { get; set; } = "string";
    
    [DefaultValue("string")]
    public string Address { get; set; } = "string";
    
    [SwaggerJsonDefault(typeof(DateTime))]
    public DateTime ArrivalTime { get; set; } = DateTime.UtcNow;
}
