using MediatR;
using Application.DTO.Truck;

namespace Application.CQRS.TruckCQ.Queries;

/// <summary>
/// Запрос на получение списка грузовиков с фильтрацией и сортировкой.
/// </summary>
public class GetTruckListQuery : IRequest<TruckListVm[]>
{
    /// <summary>
    /// Поисковое слово для полнотекстового поиска (в разработке).
    /// </summary>
    public string? SearchWord { get; set; }

    /// <summary>
    /// Фильтр по типу кузова (например: Тент, Рефрижератор, Изотерм).
    /// </summary>
    public string? BodyType { get; set; }

    /// <summary>
    /// Минимальная стоимость (поиск по всем видам оплаты).
    /// </summary>
    public double? PriceFrom { get; set; }

    /// <summary>
    /// Максимальная стоимость (поиск по всем видам оплаты).
    /// </summary>
    public double? PriceTo { get; set; }

    /// <summary>
    /// Город начала маршрута (соответствие начальной точке).
    /// </summary>
    public string? StartCity { get; set; }

    /// <summary>
    /// Город завершения маршрута (соответствие конечной точке).
    /// </summary>
    public string? EndCity { get; set; }

    /// <summary>
    /// Поле, по которому будет выполнена сортировка.
    /// Доступные значения: 
    /// date — дата создания, 
    /// specnumber — номер спецификации/заказа, 
    /// weight — грузоподъемность/количество машин, 
    /// cost — минимальная стоимость.
    /// </summary>
    public string? SortBy { get; init; }

    /// <summary>
    /// Направление сортировки. 
    /// true — по возрастанию, false — по убыванию.
    /// По умолчанию: true.
    /// </summary>
    public bool IsDescending { get; init; } = true;
}