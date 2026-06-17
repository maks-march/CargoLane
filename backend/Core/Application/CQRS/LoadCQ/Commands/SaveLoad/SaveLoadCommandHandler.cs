using Application.Common.Exceptions;
using Application.Interfaces;
using Domain.Models;
using Domain.Models.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Commands.SaveLoad;

public class SaveLoadCommandHandler(IAppDbContext dbContext) : IRequestHandler<SaveLoadCommand, bool>
{
    public async Task<bool> Handle(SaveLoadCommand request, CancellationToken cancellationToken)
    {
        var load = await dbContext.Loads
            .FirstOrDefaultAsync(l => l.Id == request.Id, cancellationToken);
        var user = await dbContext.BusinessUsers
            .Include(u => u.SavedLoads)
            .FirstOrDefaultAsync(u => u.Id == request.UserId);
        
        if (user == null)
            throw new NotFoundException(nameof(User), request.UserId);
        if (load == null) 
            throw new NotFoundException(nameof(LoadEntity), request.Id);

        var flag = user.SavedLoads.Any(l => l.Id == load.Id);
        if (flag)
            user.SavedLoads.Remove(load);
        else
        {
            user.SavedLoads.Add(load);
        }
        await dbContext.SaveChangesAsync(cancellationToken);
        return !flag;
    }
}