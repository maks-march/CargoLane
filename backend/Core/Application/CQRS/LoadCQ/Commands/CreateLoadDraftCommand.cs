using Application.Interfaces;
using AutoMapper;
using Domain.Models.Load;
using MediatR;

namespace Application.CQRS.LoadCQ.Commands;

public class CreateLoadDraftCommand : IRequest<Guid>
{
    public Guid UserId { get; set; }
    public DateOnly? StartDate { get; set; }
    public double? Payment { get; set; }
    public double? Insurance { get; set; }
    public string? HScode { get; set; }
    public int? Adr { get; set; }
    public string[]? SuitableCargos { get; set; }
    public string? About { get; set; }
    // Можно добавить списки Payloads и RoutePoints сюда же
}

public class CreateLoadDraftCommandHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<CreateLoadDraftCommand, Guid>
{
    public async Task<Guid> Handle(CreateLoadDraftCommand request, CancellationToken ct)
    {
        var draft = mapper.Map<LoadDraft>(request);
        draft.UserId = request.UserId;
        draft.Created = DateTime.Now;

        dbContext.LoadDrafts.Add(draft);
        await dbContext.SaveChangesAsync(ct);

        return draft.Id;
    }
}