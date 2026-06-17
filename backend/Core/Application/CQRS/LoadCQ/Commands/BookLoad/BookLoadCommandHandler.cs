using Application.Common.Exceptions;
using Application.Interfaces;
using Domain.Enums.Load;
using Domain.Models;
using Domain.Models.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Commands.BookLoad;

public class BookLoadCommandHandler(IAppDbContext dbContext) 
    : IRequestHandler<BookLoadCommand, (string BookerName, int Article, Guid ownerId)>
{
    public async Task<(string BookerName, int Article, Guid ownerId)> Handle(BookLoadCommand request, CancellationToken cancellationToken)
    {
        var load = await dbContext.Loads
            .FirstOrDefaultAsync(l => l.Id == request.Id && l.Status == LoadStatus.Active, cancellationToken);
        
        if (load == null) 
            throw new NotFoundException(nameof(LoadEntity), request.Id);
        
        var user = await dbContext.BusinessUsers.FirstOrDefaultAsync(u => u.Id == load.UserId, cancellationToken);
        if (user == null) 
            throw new NotFoundException(nameof(User), request.UserId);
        
        
        load.Status = LoadStatus.Booked;
        load.Updated = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return (user.DisplayName, load.Article, user.Id);
    }
}