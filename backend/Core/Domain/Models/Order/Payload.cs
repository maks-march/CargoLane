using Domain.Enums;
using Domain.Models.Abstract;

namespace Domain.Models.Order;

public class Payload : CollectionField<OrderEntity>
{
    public required string Name { get; set; }
    public required double Weight { get; set; } = 1;
    public required double Volume { get; set; } = 1;
    public int Amount { get; set; } = 1;
    public Wrap Wrap { get; set; } = Wrap.None;
    
}