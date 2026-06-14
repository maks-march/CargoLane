using Application.Common.Mappings;
using AutoMapper;
using Domain.Models;
using MediatR;

namespace Application.CQRS.UserCQ.Commands.UpdateCompany;

public record UpdateUserCompanyCommand : IRequest<Guid>, IMapWith<User>
{
    public Guid Id { get; set; }
    
    public string? CompanyName { get; init; }
    public string? CompanyCountry { get; init; }
    public string? CompanyType { get; init; }

    public void Mapping(Profile profile)
    {
        profile.CreateMap<UpdateUserCompanyCommand, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
    }
}