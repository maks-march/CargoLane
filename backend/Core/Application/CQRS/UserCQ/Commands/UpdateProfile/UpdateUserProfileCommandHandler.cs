using Application.Common.Exceptions;
using Application.Interfaces;
using AutoMapper;
using Domain.Models;
using MediatR;

namespace Application.CQRS.UserCQ.Commands.UpdateProfile;

public class UpdateUserProfileCommandHandler(IAppDbContext dbContext, IMapper mapper)
    : IRequestHandler<UpdateUserProfileCommand, Guid>
{
    public async Task<Guid> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await dbContext.BusinessUsers.FindAsync(new object[] { request.Id }, cancellationToken);
        if (user == null)
            throw new NotFoundException(nameof(User), request.Id);

        mapper.Map(request, user);
        user.Updated = DateTime.UtcNow;

        dbContext.BusinessUsers.Update(user);
        await dbContext.SaveChangesAsync(cancellationToken);
        return user.Id;
    }
}