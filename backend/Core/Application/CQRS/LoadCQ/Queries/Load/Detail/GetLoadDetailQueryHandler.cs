using Application.Common.Exceptions;
using Application.DTO.Load;
using Application.Interfaces;
using AutoMapper;
using Domain.Models.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.LoadCQ.Queries.Load.Detail;

public class GetLoadDetailQueryHandler(IAppDbContext dbContext, IMapper mapper) 
    : IRequestHandler<GetLoadDetailQuery, LoadDetailsVm>
{
    public async Task<LoadDetailsVm> Handle(GetLoadDetailQuery request, CancellationToken cancellationToken)
    {
        var load = await dbContext.Loads
            .Include(l => l.Payloads)
            .Include(l => l.RoutePoints)
            .Include(l => l.Photos)
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == request.Id, cancellationToken);

        if (load == null) throw new NotFoundException(nameof(LoadEntity), request.Id);
        return mapper.Map<LoadDetailsVm>(load);
    }
}