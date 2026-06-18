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
            .FirstOrDefaultAsync(l => l.Id == request.Id && l.UserId == request.UserId && l.Status == LoadStatus.Booked, cancellationToken);
        
        if (load == null) 
            throw new NotFoundException(nameof(LoadEntity), request.Id);
        
        load.Status = LoadStatus.Active;
        load.Updated = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return load.Id;
    }
}