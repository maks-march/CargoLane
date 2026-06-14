using Application.Common.Exceptions;
using Application.DTO.User;
using Application.Interfaces;
using AutoMapper;
using Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.UserCQ.Queries.GetUserDetails;

public class GetUserDetailsQueryHandler(
    IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<GetUserDetailsQuery, UserDetailsVm>
{
    public async Task<UserDetailsVm> Handle(GetUserDetailsQuery request, CancellationToken cancellationToken)
    {
        var result = await (
                from bu in dbContext.BusinessUsers
                        .Include(u => u.Avatar)
                join au in dbContext.Users on bu.Id equals au.Id
                where bu.Id == request.Id
                select new 
                { 
                    BusinessUser = bu, 
                    Email = au.Email 
                })
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);

        if (result == null)
            throw new NotFoundException(nameof(User), request.Id);

        var vm = mapper.Map<UserDetailsVm>(result.BusinessUser);

        return vm with { Email = result.Email ?? string.Empty };
    }
}