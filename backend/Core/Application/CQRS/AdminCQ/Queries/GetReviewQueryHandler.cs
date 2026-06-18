using Application.Common.Exceptions;
using Application.DTO.Load;
using Application.Interfaces;
using AutoMapper;
using Domain.Enums.Load;
using Domain.Models.Load;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.CQRS.AdminCQ.Queries;

public class GetReviewQueryHandler(IAppDbContext dbContext, IMapper mapper) : IRequestHandler<GetReviewQuery, LoadDetailsVm>
{
    public async Task<LoadDetailsVm> Handle(GetReviewQuery request, CancellationToken cancellationToken)
    {
        var load = await dbContext.Loads
            .Include(l => l.User)
            .Include(l => l.Payloads)
            .Include(l => l.RoutePoints)
            .Include(l => l.Photos)
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == request.Id && l.Status == LoadStatus.Pending, cancellationToken);

        if (load == null) throw new NotFoundException(nameof(LoadEntity), request.Id);
        return mapper.Map<LoadDetailsVm>(load);
    }
}