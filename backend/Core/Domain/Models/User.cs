using Domain.Models.Abstract;
using Domain.Models.Truck;

namespace Domain.Models;

public class User : Entity
{
    public required string Name { get; set; }
    public required string Surname { get; set; }
    public ICollection<TruckEntity> Trucks { get; set; } = new List<TruckEntity>();
    public ICollection<Order.OrderEntity> Orders { get; set; } = new List<Order.OrderEntity>();
}