using Application.Common.Exceptions;
using Application.Interfaces;
using Application.Interfaces.Auth;
using MediatR;

namespace Application.CQRS.UserCQ.Commands.Delete;

public class DeleteUserCommandHandler(IAppDbContext dbContext, IIdentityService identityService) 
    : IRequestHandler<DeleteUserCommand>
{
    public async Task Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        // 1. Проверяем существование доменного пользователя
        var businessUser = await dbContext.BusinessUsers
            .FindAsync([request.Id], cancellationToken: cancellationToken);

        if (businessUser == null)
        {
            throw new NotFoundException(nameof(Domain.Models.User), request.Id);
        }

        // 2. Удаляем из ASP.NET Identity (самое важное!)
        var (succeeded, errors) = await identityService.DeleteUser(request.Id);

        if (!succeeded)
        {
            throw new InvalidOperationException(
                $"Не удалось удалить пользователя из Identity: {string.Join("; ", errors)}");
        }

        // 3. Удаляем доменную запись
        dbContext.BusinessUsers.Remove(businessUser);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}