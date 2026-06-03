using Application.DTO.Order;
using MediatR;

namespace Application.CQRS.OrderCQ.Queries.GetOrdersList;

/// <summary>
/// Запрос на выдачу заказов
/// </summary>
public record GetOrderListQuery : IRequest<IList<OrderListVm>>
{
    /// <summary>
    /// В разработке
    /// </summary>
    public string? SearchWord { get; set; }
    /// <summary>
    /// Фильтр на статус заказа
    /// </summary>
    public string? Status { get; init; }
    
    /// <summary>
    /// Город отправки
    /// </summary>
    public string? StartCity { get; init; }
    
    /// <summary>
    /// Город адресат
    /// </summary>
    public string? EndCity { get; init; }
    
    /// <summary>
    /// Отправка с этого числа
    /// </summary>
    public DateOnly? MinStartDate { get; init; }
    /// <summary>
    /// Максимальный вес
    /// </summary>
    public double? MaxWeight { get; init; }
    /// <summary>
    /// Сортировать по
    /// дате - date
    /// номеру заказа - specnumber
    /// весу - weight
    /// стоимости - cost
    /// </summary>
    public string? SortBy { get; init; } 
    /// <summary>
    /// По возрастанию
    /// </summary>
    public bool IsAscending { get; init; } = true;
}