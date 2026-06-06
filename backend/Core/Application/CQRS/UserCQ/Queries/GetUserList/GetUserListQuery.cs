using Application.DTO.User;
using MediatR;

namespace Application.CQRS.UserCQ.Queries.GetUserList;

public class GetUserListQuery : IRequest<ICollection<UserDetailsVm>>
{
    
}