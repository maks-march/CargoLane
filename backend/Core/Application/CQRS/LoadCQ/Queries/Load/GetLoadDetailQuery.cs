using Application.Common.Exceptions;
using Application.DTO.Load;
using Application.Interfaces;
using AutoMapper;
using Domain.Models.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Queries.Load;

public record GetLoadDetailQuery(Guid Id) : IRequest<LoadDetailsVm>
{ }

public class GetLoadDetailQueryHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<GetLoadDetailQuery, LoadDetailsVm>
{
    public async Task<LoadDetailsVm> Handle(GetLoadDetailQuery request, CancellationToken ct)
    {
        var load = await dbContext.Loads
            .Include(l => l.Payloads)
            .Include(l => l.RoutePoints)
            .Include(l => l.Photos)
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == request.Id, ct);

        if (load == null) throw new NotFoundException(nameof(LoadEntity), request.Id);
        return mapper.Map<LoadDetailsVm>(load);
    }
}