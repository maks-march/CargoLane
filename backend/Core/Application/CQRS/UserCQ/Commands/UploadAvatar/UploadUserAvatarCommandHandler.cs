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
        if (request.Avatar == null)
            throw new InvalidOperationException("Avatar file is required");

        var user = await dbContext.BusinessUsers
            .Include(u => u.Avatar)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
            throw new NotFoundException(nameof(User), request.UserId);

        // Удаляем старый аватар, если есть
        if (user.Avatar != null)
        {
            await fileService.DeleteFiles(cancellationToken, user.Avatar.FilePath);
            dbContext.UserFiles.Remove(user.Avatar);
            user.Avatar = null;
            user.AvatarId = null;
        }

        // Сохраняем новый файл
        var savedPaths = await fileService.SaveFiles(cancellationToken, request.Avatar);
        if (savedPaths.Length == 0)
            throw new InvalidOperationException("Failed to save avatar file");

        var newFile = new UserFile
        {
            FilePath = savedPaths[0],
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