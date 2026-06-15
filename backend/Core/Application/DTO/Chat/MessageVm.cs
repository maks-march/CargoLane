using Application.Common.Mappings;
using AutoMapper;
using Domain.Models.Chat;

namespace Application.DTO.Chat;

public record MessageVm : IMapWith<ChatMessageEntity>
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public DateTime Created { get; set; }
    public bool IsRead { get; set; }
    public bool IsSystem { get; set; } = false;   // Добавлено по контракту

    public void Mapping(Profile profile)
    {
        profile.CreateMap<ChatMessageEntity, MessageVm>()
            .ForMember(vm => vm.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(vm => vm.SenderId, opt => opt.MapFrom(src => src.SenderId))
            .ForMember(vm => vm.SenderName, opt => opt.MapFrom(src => $"{src.Sender.FirstName} {src.Sender.LastName}"))
            .ForMember(vm => vm.Text, opt => opt.MapFrom(src => src.Text))
            .ForMember(vm => vm.IsRead, opt => opt.MapFrom(src => src.IsRead))
            .ForMember(vm => vm.Created, opt => opt.MapFrom(src => src.Created));
    }
}
