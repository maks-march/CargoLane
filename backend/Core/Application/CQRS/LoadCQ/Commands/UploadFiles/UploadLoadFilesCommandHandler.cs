using Application.Common.Exceptions;
using Application.CQRS.FileCQ;
using Application.Interfaces;
using Domain.Models.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Commands.UploadFiles;

public class UploadLoadFilesCommandHandler(IAppDbContext dbContext, IFileService fileService) : UploadPhotoCommandHandler<LoadEntity>(dbContext), IRequestHandler<UploadLoadFilesCommand, string[]>
{
    public async Task<string[]> Handle(UploadLoadFilesCommand request, CancellationToken cancellationToken)
    {
        var load = await DbContext.GetDbSet<LoadEntity>()
            .Include(x => x.Photos)
            .FirstOrDefaultAsync(o => o.Id == request.LoadId, cancellationToken);
        if (load == null)
            throw new NotFoundException(nameof(load), request.LoadId);
        if (load.UserId != request.UserId)
            throw new ForbiddenException(nameof(load), request.UserId);
        var save = await fileService.SaveFiles(cancellationToken, request.Files);
        await fileService.DeleteFiles(cancellationToken, load.Photos
            .Select(f => f.FilePath)
            .ToArray());
        UpdateCollection(load.Photos, save, load);
        await DbContext.SaveChangesAsync(cancellationToken);
        return save;
    }
}