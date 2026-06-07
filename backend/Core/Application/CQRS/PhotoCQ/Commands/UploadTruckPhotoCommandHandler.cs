using Application.Common.Exceptions;
using Application.Interfaces;
using Domain.Models.Truck;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.PhotoCQ.Commands;

public class UploadTruckPhotoCommandHandler(
    IAppDbContext dbContext,
    IFileService fileService
) : UploadPhotoCommandHandler<TruckEntity>(dbContext), IRequestHandler<UploadPhotoCommand<TruckEntity>>
{
    public async Task Handle(UploadPhotoCommand<TruckEntity> request, CancellationToken cancellationToken)
    {
        var truck = await DbContext.GetDbSet<TruckEntity>()
            .Include(x => x.Photos)
            .FirstOrDefaultAsync(o => o.Id == request.ItemId, cancellationToken);
        if (truck == null)
            throw new NotFoundException(nameof(truck), request.ItemId);
        if (truck.UserId != request.UserId)
            throw new ForbiddenException(nameof(truck), request.UserId);
        var save = await fileService.SaveFiles(cancellationToken, request.Photos);
        await fileService.DeleteFiles(cancellationToken, truck.Photos
            .Select(f => f.FilePath)
            .ToArray());
        UpdateCollection(truck.Photos, save, truck);
        await DbContext.SaveChangesAsync(cancellationToken);
    }
}