using Application.Common.Exceptions;
using Application.Interfaces;
using Domain.Enums.Load;
using Domain.Models;
using Domain.Models.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.AdminCQ.Commands;

public class ChangeLoadStatusHandler(IAppDbContext dbContext) : IRequestHandler<ChangeLoadStatus, Guid>
{
    public async Task<Guid> Handle(ChangeLoadStatus request, CancellationToken cancellationToken)
    {
        var load = await dbContext.Loads
            .FirstOrDefaultAsync(l => l.Id == request.Id && l.Status == LoadStatus.Pending, cancellationToken);
        
        if (load == null) 
            throw new NotFoundException(nameof(LoadEntity), request.Id);
        var user = await dbContext.BusinessUsers.FirstOrDefaultAsync(u => u.Id == request.UserId);
        if (user == null) 
            throw new NotFoundException(nameof(User), request.UserId);
        
        
        load.Status = request.Status;
        load.Updated = DateTime.UtcNow;
        load.ReviewDate = DateTime.UtcNow;
        load.RejectReason = request.Reason;
        load.ReviewerName = user.DisplayName;
        await dbContext.SaveChangesAsync(cancellationToken);
        return load.Id;
    }
}