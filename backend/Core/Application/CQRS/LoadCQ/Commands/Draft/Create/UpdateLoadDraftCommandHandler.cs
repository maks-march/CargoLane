using Application.Common.Exceptions;
using Application.Interfaces;
using AutoMapper;
using Domain.Models.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Commands.Draft.Create;

public class UpdateLoadDraftCommandHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<UpdateLoadDraftCommand, Guid>
{
    public async Task<Guid> Handle(UpdateLoadDraftCommand request, CancellationToken ct)
    {
        var draft = await dbContext.LoadDrafts
            .Include(d => d.Payloads)
            .Include(d => d.RoutePoints)
            .FirstOrDefaultAsync(d => d.Id == request.Id, ct);

        if (draft == null) throw new NotFoundException(nameof(LoadDraft), request.Id);
        if (draft.UserId != request.UserId) throw new ForbiddenException("Access denied", request.UserId);
        if (draft.Payloads != null)
            dbContext.PayloadDraft.RemoveRange(draft.Payloads);
        if (draft.RoutePoints != null)
            dbContext.RoutePointsDraft.RemoveRange(draft.RoutePoints);
        draft.Payloads = null;
        draft.RoutePoints = null;
        await dbContext.SaveChangesAsync(ct);
        // Мапим изменения (используя Null-проверку в профиле AutoMapper)
        mapper.Map(request, draft);
        draft.Updated = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(ct);
        return draft.Id;
    }
}