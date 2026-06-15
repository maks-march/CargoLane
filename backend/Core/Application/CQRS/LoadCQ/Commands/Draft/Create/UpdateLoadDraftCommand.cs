using Application.Common.Exceptions;
using Application.Interfaces;
using AutoMapper;
using Domain.Models.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Commands.Draft.Create;

public class UpdateLoadDraftCommand : CreateLoadDraftCommand
{
    public Guid Id { get; set; }
}

public class UpdateLoadDraftCommandHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<UpdateLoadDraftCommand, Guid>
{
    public async Task<Guid> Handle(UpdateLoadDraftCommand request, CancellationToken ct)
    {
        var draft = await dbContext.LoadDrafts
            .FirstOrDefaultAsync(d => d.Id == request.Id, ct);

        if (draft == null) throw new NotFoundException(nameof(LoadDraft), request.Id);
        if (draft.UserId != request.UserId) throw new ForbiddenException("Access denied", request.UserId);

        // Мапим изменения (используя Null-проверку в профиле AutoMapper)
        mapper.Map(request, draft);
        draft.Updated = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(ct);
        return draft.Id;
    }
}