using Application.Interfaces;
using MediatR;

namespace Application.CQRS.UserCQ.Commands.Create;

public class CreateUserCommandHandler(IAppDbContext dbContext) 
    : IRequestHandler<CreateUserCommand, Guid>
{
    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var user = new Domain.Models.User
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Created = DateTime.Now,
            Updated = DateTime.Now
        };
        dbContext.BusinessUsers.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);
        return user.Id;
    }
}