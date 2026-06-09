using Application.Common.Exceptions;
using Application.Interfaces;
using Domain.Models.Load;
using MediatR;

namespace Application.CQRS.LoadCQ.Commands;

public record DeleteLoadCommand(Guid Id, Guid UserId) : IRequest;

public class DeleteLoadCommandHandler(IAppDbContext dbContext) : IRequestHandler<DeleteLoadCommand>
{
    public async Task Handle(DeleteLoadCommand request, CancellationToken ct)
    {
        var load = await dbContext.Loads.FindAsync([request.Id], ct);

        if (load == null) throw new NotFoundException(nameof(LoadEntity), request.Id);
        
        // Проверка прав доступа
        if (load.UserId != request.UserId) throw new ForbiddenException("Access denied", request.UserId);

        dbContext.Loads.Remove(load);
        await dbContext.SaveChangesAsync(ct);
    }
}