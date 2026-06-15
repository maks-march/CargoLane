using Application.Common.Mappings;
using AutoMapper;
using Domain.Models;
using MediatR;

namespace Application.CQRS.UserCQ.Commands.UpdateProfile;

public record UpdateUserProfileCommand : IRequest<Guid>, IMapWith<User>
{
    public Guid Id { get; set; }
    
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? NickName { get; init; }
    public string? PhoneNumber { get; init; }
    public int? TimeZone { get; init; }
    
    public string? Country { get; init; }
    public string? Region { get; init; }
    public string? City { get; init; }
    public string? Address { get; init; }
    public string? PostalCode { get; init; }
    public string? Purpose { get; init; }

    public void Mapping(Profile profile)
    {
        profile.CreateMap<UpdateUserProfileCommand, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
    }
}