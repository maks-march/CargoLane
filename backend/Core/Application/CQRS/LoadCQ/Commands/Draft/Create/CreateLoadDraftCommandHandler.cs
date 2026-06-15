using Application.Interfaces;
using AutoMapper;
using Domain.Models.Load;
using MediatR;

namespace Application.CQRS.LoadCQ.Commands.Draft.Create;

public class CreateLoadDraftCommandHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<CreateLoadDraftCommand, Guid>
{
    public async Task<Guid> Handle(CreateLoadDraftCommand request, CancellationToken ct)
    {
        var draft = mapper.Map<LoadDraft>(request);
        draft.UserId = request.UserId;
        draft.Created = DateTime.UtcNow;
        draft.Updated = DateTime.UtcNow;

        dbContext.LoadDrafts.Add(draft);
        await dbContext.SaveChangesAsync(ct);

        return draft.Id;
    }
}