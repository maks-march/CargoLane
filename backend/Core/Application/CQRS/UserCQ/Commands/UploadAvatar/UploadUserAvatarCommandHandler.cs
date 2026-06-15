using Application.Common.Exceptions;
using Application.Interfaces;
using Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.UserCQ.Commands.UploadAvatar;

public class UploadUserAvatarCommandHandler(
    IAppDbContext dbContext,
    IFileService fileService
) : IRequestHandler<UploadUserAvatarCommand, string>
{
    public async Task<string> Handle(UploadUserAvatarCommand request, CancellationToken cancellationToken)
    {
        
        var user = await dbContext.GetDbSet<User>()
            .Include(x => x.Avatar)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user == null)
            throw new NotFoundException(nameof(user), request.UserId);
        var save = await fileService.SaveFiles(cancellationToken, request.Avatar);
        if (save.Length == 0)
            throw new InvalidOperationException("Failed to save avatar file");
        if (user.Avatar != null)
        {
            await fileService.DeleteFiles(cancellationToken, user.Avatar.FilePath);
            dbContext.GetDbSet<UserFile>().Remove(user.Avatar);
        }
        
        var newFile = new UserFile
        {
            FilePath = save[0],
            OwnerId = user.Id,
            Owner = user
        };

        await dbContext.UserFiles.AddAsync(newFile, cancellationToken);
        user.Avatar = newFile;
        user.AvatarId = newFile.Id;

        user.Updated = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
        return newFile.FilePath;
    }
}