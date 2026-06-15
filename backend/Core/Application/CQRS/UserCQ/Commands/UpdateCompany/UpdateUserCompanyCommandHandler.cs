using Application.Common.Exceptions;
using Application.Interfaces;
using AutoMapper;
using Domain.Models;
using MediatR;

namespace Application.CQRS.UserCQ.Commands.UpdateCompany;

public class UpdateUserCompanyCommandHandler(IAppDbContext dbContext, IMapper mapper)
    : IRequestHandler<UpdateUserCompanyCommand, Guid>
{
    public async Task<Guid> Handle(UpdateUserCompanyCommand request, CancellationToken cancellationToken)
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