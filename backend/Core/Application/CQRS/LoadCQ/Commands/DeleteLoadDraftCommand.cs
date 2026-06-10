using Application.Common.Exceptions;
using Application.Interfaces;
using Domain.Models.Load;
using MediatR;

namespace Application.CQRS.LoadCQ.Commands;

public record DeleteLoadDraftCommand(Guid Id, Guid UserId) : IRequest;

public class DeleteLoadDraftCommandHandler(IAppDbContext dbContext) : IRequestHandler<DeleteLoadDraftCommand>
{
    public async Task Handle(DeleteLoadDraftCommand request, CancellationToken ct)
    {
        var draft = await dbContext.LoadDrafts.FindAsync([request.Id], ct);

        if (draft == null) throw new NotFoundException(nameof(LoadDraft), request.Id);
        if (draft.UserId != request.UserId) throw new ForbiddenException("Access denied", request.UserId);

        dbContext.LoadDrafts.Remove(draft);
        await dbContext.SaveChangesAsync(ct);
    }
}