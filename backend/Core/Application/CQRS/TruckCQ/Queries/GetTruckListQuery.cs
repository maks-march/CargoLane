using MediatR;
using Application.DTO.Truck;

namespace Application.CQRS.TruckCQ.Queries;

public class GetTruckListQuery : IRequest<TruckListVm[]>
{
    /// <summary>
    /// В разработке
    /// </summary>
    public string? SearchWord { get; set; }
    public string? BodyType { get; set; }
    public double? PriceFrom {  get; set; }
    public double? PriceTo {  get; set; }
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