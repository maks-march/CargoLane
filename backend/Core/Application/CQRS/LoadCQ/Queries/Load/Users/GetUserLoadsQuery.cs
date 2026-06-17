using Application.DTO.Load;
using MediatR;

namespace Application.CQRS.LoadCQ.Queries.Load.Users;

public class GetUserLoadsQuery : IRequest<LoadListVm[]>
{
    public Guid UserId { get; set; }
    
    public string Status { get; set; } = "Active";
}