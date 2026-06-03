using Domain.Enums;
using Domain.Models.Abstract;

namespace Domain.Models.Order;

public class OrderEntity : HasAuthor, IManyFiles<OrderPhoto>
{
    public required DateOnly StartDate { get; set; }
    public required OrderStatus Status { get; set; }
    
    public int SpecNumber { get; set; }
    public string About { get; set; } = string.Empty;
    public IList<OrderPhoto> Photos { get; set; } = [];
    
    public required Payment Payment { get; set; }
    public required Transport Transport { get; set; }

    public IList<Payload> Payloads { get; set; } = [];
    public IList<RoutePoint<OrderEntity>> RoutePoints { get; set; } = [];
}