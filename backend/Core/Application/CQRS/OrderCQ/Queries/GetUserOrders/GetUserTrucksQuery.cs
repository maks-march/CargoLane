using Application.DTO.Order;
using MediatR;

namespace Application.CQRS.OrderCQ.Queries.GetUserOrders;

public record GetUserOrdersQuery(Guid Id) : IRequest<OrderListVm[]>;