using Application.DTO.Load;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Queries.Draft;

public record GetUserLoadDraftQuery(Guid UserId) : IRequest<LoadDraftVm[]>;

public class GetUserLoadDraftQueryHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<GetUserLoadDraftQuery, LoadDraftVm[]>
{
    public async Task<LoadDraftVm[]> Handle(GetUserLoadDraftQuery request, CancellationToken ct)
    {
        var drafts = await dbContext.LoadDrafts
            .AsNoTracking()
            .Include(d => d.Payloads)     // Нужно для PayloadCount в VM
            .Include(d => d.RoutePoints)  // Нужно для StartCity/EndCity в VM
            .Where(d => d.UserId == request.UserId)
            .OrderByDescending(d => d.Created) // Обычно черновики показывают от новых к старым
            .ProjectTo<LoadDraftVm>(mapper.ConfigurationProvider)
            .ToArrayAsync(ct);

        return drafts;
    }
}