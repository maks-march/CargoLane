using Application.DTO.Load;
using MediatR;

namespace Application.CQRS.AdminCQ.Queries;

public record GetReviewQuery(Guid Id) : IRequest<LoadDetailsVm>;