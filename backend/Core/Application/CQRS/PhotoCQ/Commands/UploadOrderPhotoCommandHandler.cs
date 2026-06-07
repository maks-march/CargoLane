using Application.Common.Exceptions;
using Application.Interfaces;
using Domain.Models.Order;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.PhotoCQ.Commands;

public class UploadOrderPhotoCommandHandler(
    IAppDbContext dbContext,
    IFileService fileService
) : UploadPhotoCommandHandler<OrderEntity>(dbContext), IRequestHandler<UploadPhotoCommand<OrderEntity>>
{
    public async Task Handle(UploadPhotoCommand<OrderEntity> request, CancellationToken cancellationToken)
    {
        var order = await DbContext.GetDbSet<OrderEntity>()
            .Include(x => x.Photos)
            .FirstOrDefaultAsync(o => o.Id == request.ItemId, cancellationToken);
        if (order == null)
            throw new NotFoundException(nameof(order), request.ItemId);
        if (order.UserId != request.UserId)
            throw new ForbiddenException(nameof(order), request.UserId);
        var save = await fileService.SaveFiles(cancellationToken, request.Photos);
        await fileService.DeleteFiles(cancellationToken, order.Photos
            .Select(f => f.FilePath)
            .ToArray());
        UpdateCollection(order.Photos, save, order);
        await DbContext.SaveChangesAsync(cancellationToken);
    }
}