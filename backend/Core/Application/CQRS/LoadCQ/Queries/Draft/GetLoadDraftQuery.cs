using Application.Common.Exceptions;
using Application.DTO.Load;
using Application.Interfaces;
using AutoMapper;
using Domain.Models.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Queries.Draft;

public class GetLoadDraftQuery : IRequest<LoadDraftVm>
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
}

public class GetLoadDraftQueryHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<GetLoadDraftQuery, LoadDraftVm>
{
    public async Task<LoadDraftVm> Handle(GetLoadDraftQuery request, CancellationToken ct)
    {
        var draft = await dbContext.LoadDrafts
            .Include(d => d.Payloads)
            .Include(d => d.RoutePoints)
            .FirstOrDefaultAsync(d => d.Id == request.Id && d.UserId == request.UserId, ct);

        if (draft == null)
            throw new NotFoundException(nameof(LoadDraft), request.Id);

        return mapper.Map<LoadDraftVm>(draft);
    }
}