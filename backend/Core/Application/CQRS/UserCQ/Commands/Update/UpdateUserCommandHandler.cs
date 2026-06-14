using Application.Common.Exceptions;
using Application.Interfaces;
using AutoMapper;
using Domain.Models;
using MediatR;

namespace Application.CQRS.UserCQ.Commands.Update;

public class UpdateUserCommandHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<UpdateUserCommand, Guid>
{
    public async Task<Guid> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await dbContext.BusinessUsers.FindAsync([request.Id], cancellationToken);
        if (user == null || user.Id != request.Id)
        {
            throw new NotFoundException(nameof(User), request.Id);
        }
        mapper.Map(request, user);
        user.Updated = DateTime.UtcNow;
        
        dbContext.BusinessUsers.Update(user);
        await dbContext.SaveChangesAsync(cancellationToken);
        return user.Id;
    }
}