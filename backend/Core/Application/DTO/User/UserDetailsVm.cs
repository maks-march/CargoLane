using Application.Common.Mappings;
using AutoMapper;

namespace Application.DTO.User;

public record UserDetailsVm : IMapWith<Domain.Models.User>
{
    public required Guid Id { get; init; }
    
    public required string Email { get; init; }
    
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public int Timezone { get; init; }
    public string Phone { get; init; } = string.Empty;
    public bool IsMetric { get; init; } = true;
    
    // Поля компании
    public string CompanyName { get; init; } = string.Empty;
    public string CompanyCountry { get; init; } = string.Empty;
    public string CompanyType { get; init; } = string.Empty;
    
    // Адресные поля
    public string Country { get; init; } = string.Empty;
    public string Region { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;

    // Ссылка на аватар
    public string? AvatarPath { get; init; }
    public DateTime Created { get; init; }
    public DateTime Updated { get; init; }

    public void Mapping(Profile profile)
    {
        profile.CreateMap<Domain.Models.User, UserDetailsVm>()
            .ForMember(vm => vm.Email, opt => 
                opt.Ignore())
            .ForMember(vm => vm.Id,
                opt => opt.MapFrom(src => src.Id))
            .ForMember(vm => vm.AvatarPath,
                opt => opt.MapFrom(src => src.Avatar != null ? src.Avatar.FilePath : null))
            .ForMember(vm => vm.Created,
                opt => opt.MapFrom(src => src.Created))
            .ForMember(vm => vm.Updated,
                opt => opt.MapFrom(src => src.Updated));
    }
}