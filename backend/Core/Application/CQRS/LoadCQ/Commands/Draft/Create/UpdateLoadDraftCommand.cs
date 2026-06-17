using Application.Common.Mappings;
using Application.CQRS.LoadCQ.Commands.CreateLoad;
using AutoMapper;
using Domain.Models.Abstract;
using Domain.Models.Load;

namespace Application.CQRS.LoadCQ.Commands.Draft.Create;

public class UpdateLoadDraftCommand : CreateLoadDraftCommand, IMapWith<LoadDraft>
{
    public Guid Id { get; set; }
    public new IList<RoutePointDraftUpdateDto>? RoutePoints { get; set; } = null;
    public new IList<PayloadDraftUpdateDto>? Payloads { get; set; } = null;

    public new void Mapping(Profile profile)
    {
        profile.CreateMap<UpdateLoadDraftCommand, LoadDraft>()
            // Игнорируем поля, которые устанавливаются вручную в хендлере
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            // Маппим коллекции (AutoMapper автоматически обработает null, если настроено)
            .ForMember(dest => dest.RoutePoints, opt => opt.MapFrom(src => src.RoutePoints))
            .ForMember(dest => dest.Payloads, opt => opt.MapFrom(src => src.Payloads))
            .ForAllMembers(opts => 
                opts.Condition((src, dest, srcMember) => 
                    srcMember != null));
        
        profile.CreateMap<PayloadDraftUpdateDto, PayloadDraft>()
            // .ForMember(dest => dest.Type, opt =>
            // {
            //     opt.Condition(src => src.Type != null);
            //     opt.MapFrom(src => Enum.Parse<PayloadType>(src.Type, true));
            // })
            .ForAllMembers(opts => 
                opts.Condition((src, dest, srcMember) => 
                    srcMember != null));
        
        profile.CreateMap<RoutePointDraftUpdateDto, RoutePoint<LoadDraft>>()
            .ForAllMembers(opts => 
                opts.Condition((src, dest, srcMember) => 
                    srcMember != null));
    }
}

public record PayloadDraftUpdateDto : PayloadDraftInputDto;
public record RoutePointDraftUpdateDto : RoutePointInputDto;