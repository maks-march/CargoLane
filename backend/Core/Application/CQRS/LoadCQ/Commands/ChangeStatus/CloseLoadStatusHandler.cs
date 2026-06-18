using Application.Common.Exceptions;
using Application.Interfaces;
using Domain.Enums.Load;
using Domain.Models.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Commands.ChangeStatus;

public class CloseLoadStatusHandler(IAppDbContext dbContext) : IRequestHandler<CloseLoadStatus, Guid>
{
    public async Task<Guid> Handle(CloseLoadStatus request, CancellationToken cancellationToken)
    {
        var load = await dbContext.Loads
            .FirstOrDefaultAsync(l => l.Id == request.Id, cancellationToken);
        
        
        if (load == null) 
            throw new NotFoundException(nameof(LoadEntity), request.Id);
        if (load.UserId != request.UserId)
            throw new ForbiddenException("Access denied", request.UserId);
        if (load.Status == LoadStatus.Closed)
            throw new InvalidOperationException("Load is already closed");
        
        load.Status = LoadStatus.Closed;
        load.Updated = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return load.Id;
    }
}