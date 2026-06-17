using Application.DTO.Load;
using Domain.Enums.Load;
using MediatR;

namespace Application.CQRS.AdminCQ.Queries;

public record GetReviewsQuery(LoadStatus? Status) : IRequest<LoadListVm[]>;