using Application.Common.Exceptions;
using Application.DTO.User;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.UserCQ.Queries.GetUserList;

public class GetUserListQueryHandler(
    IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<GetUserListQuery, ICollection<UserDetailsVm>>
{
    public async Task<ICollection<UserDetailsVm>> Handle(GetUserListQuery request, CancellationToken cancellationToken)
    {
        var users = await dbContext.BusinessUsers
            .ProjectTo<UserDetailsVm>(mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
        if (users == null || users.Count == 0)
        {
            throw new NotFoundException(nameof(User), request);
        }

        return users;
    }
}