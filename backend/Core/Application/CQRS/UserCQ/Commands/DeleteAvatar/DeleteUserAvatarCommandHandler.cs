using Application.Common.Exceptions;
using Application.Interfaces;
using Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.UserCQ.Commands.DeleteAvatar;

public class DeleteUserAvatarCommandHandler(
    IAppDbContext dbContext,
    IFileService fileService
) : IRequestHandler<DeleteUserAvatarCommand>
{
    public async Task Handle(DeleteUserAvatarCommand request, CancellationToken cancellationToken)
    {
        var user = await dbContext.BusinessUsers
            .Include(u => u.Avatar)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
            throw new NotFoundException(nameof(User), request.UserId);

        if (user.Avatar != null)
        {
            await fileService.DeleteFiles(cancellationToken, user.Avatar.FilePath);
            dbContext.UserFiles.Remove(user.Avatar);
            user.Avatar = null;
            user.AvatarId = null;
        }

        user.Updated = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}