using Application.Common.Mappings;
using AutoMapper;

namespace Application.DTO.User;

public record UserDetailsVm : IMapWith<Domain.Models.User>
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Surname { get; init; }
    public string NickName { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public int TimeZone { get; init; }
    public string PhoneNumber { get; init; } = string.Empty;
    
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
    public string Purpose { get; init; } = string.Empty;

    // Ссылка на аватар
    public string? AvatarPath { get; init; }

    public DateTime Created { get; init; }
    public DateTime Updated { get; init; }

    public void Mapping(Profile profile)
    {
        profile.CreateMap<Domain.Models.User, UserDetailsVm>()
            .ForMember(vm => vm.Id,
                opt => opt.MapFrom(src => src.Id))
            .ForMember(vm => vm.Name,
                opt => opt.MapFrom(src => src.FirstName))
            .ForMember(vm => vm.Surname,
                opt => opt.MapFrom(src => src.LastName))
            .ForMember(vm => vm.NickName,
                opt => opt.MapFrom(src => src.NickName))
            .ForMember(vm => vm.Role,
                opt => opt.MapFrom(src => src.Role))
            .ForMember(vm => vm.TimeZone,
                opt => opt.MapFrom(src => src.TimeZone))
            .ForMember(vm => vm.PhoneNumber,
                opt => opt.MapFrom(src => src.PhoneNumber))
            .ForMember(vm => vm.CompanyName,
                opt => opt.MapFrom(src => src.CompanyName))
            .ForMember(vm => vm.CompanyCountry,
                opt => opt.MapFrom(src => src.CompanyCountry))
            .ForMember(vm => vm.CompanyType,
                opt => opt.MapFrom(src => src.CompanyType))
            .ForMember(vm => vm.Country,
                opt => opt.MapFrom(src => src.Country))
            .ForMember(vm => vm.Region,
                opt => opt.MapFrom(src => src.Region))
            .ForMember(vm => vm.City,
                opt => opt.MapFrom(src => src.City))
            .ForMember(vm => vm.Address,
                opt => opt.MapFrom(src => src.Address))
            .ForMember(vm => vm.PostalCode,
                opt => opt.MapFrom(src => src.PostalCode))
            .ForMember(vm => vm.Purpose,
                opt => opt.MapFrom(src => src.Purpose))
            .ForMember(vm => vm.AvatarPath,
                opt => opt.MapFrom(src => src.Avatar != null ? src.Avatar.FilePath : null))
            .ForMember(vm => vm.Created,
                opt => opt.MapFrom(src => src.Created))
            .ForMember(vm => vm.Updated,
                opt => opt.MapFrom(src => src.Updated));
    }
}