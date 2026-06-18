using Application.Common.Exceptions;
using Application.Interfaces;
using Domain.Enums.Load;
using Domain.Models.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Commands.ChangeStatus;

public class UnbookLoadStatusHandler(IAppDbContext dbContext) : IRequestHandler<UnbookLoadStatus, Guid>
{
    public async Task<Guid> Handle(UnbookLoadStatus request, CancellationToken cancellationToken)
    {
        var load = await dbContext.Loads
            .FirstOrDefaultAsync(l => l.Id == request.Id, cancellationToken);
        
        if (load == null) 
            throw new NotFoundException(nameof(LoadEntity), request.Id);
        if (load.UserId != request.UserId)
            throw new ForbiddenException("Access denied", request.UserId);
        if (load.Status != LoadStatus.Booked)
            throw new InvalidOperationException("Load is not booked");
        
        load.Status = LoadStatus.Active;
        load.Updated = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return load.Id;
    }
}