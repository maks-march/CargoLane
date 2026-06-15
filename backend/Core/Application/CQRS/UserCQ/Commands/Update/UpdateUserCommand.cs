using Application.Common.Mappings;
using AutoMapper;
using Domain.Models;
using MediatR;

namespace Application.CQRS.UserCQ.Commands.Update;

public record UpdateUserCommand : IRequest<Guid>, IMapWith<User>
{
    /// <summary>
    /// Идентификатор обновляемого пользователя
    /// </summary>
    public Guid Id { get; set; } = Guid.Empty;
    public string? FirstName { get; init; } = null;
    public string? LastName { get; init; } = null;
    
    public string? DisplayName { get; set; } = null;
    public int? Timezone { get; set; } = null;
    public int? IsMetric { get; set; } = null;
    public string? Phone { get; set; } = null;
    
    public string? CompanyName { get; set; } = null;
    public string? CompanyCountry { get; set; } = null;
    public string? CompanyType { get; set; } = null;
    
    public string? Country { get; set; } = null;
    public string? Region { get; set; } = null;
    public string? City { get; set; } = null;
    public string? Address { get; set; } = null;
    public string? PostalCode { get; set; } = null;
    
    public void Mapping(Profile profile)
    {
        profile.CreateMap<UpdateUserCommand, User>()
            .ForMember(dest => 
                dest.Id, opt => 
                opt.Ignore())
            .ForAllMembers(opts => 
                opts.Condition((src, dest, srcMember) => 
                    srcMember != null));
    }
}