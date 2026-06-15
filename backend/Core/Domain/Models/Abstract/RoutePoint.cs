namespace Domain.Models.Abstract;

public class RoutePoint<T> : CollectionField<T> where T : Entity
{
    public required string City { get; set; }
    public required string Address { get; set; }
    public DateTime ArrivalTime { get; set; }
}