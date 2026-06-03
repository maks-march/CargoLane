using Domain.Models.Abstract;
using Domain.Models.Truck;

namespace Domain.Models;

public abstract class FileEntity<TOwner> : CollectionEntity where TOwner : Entity
{
    public required string FilePath { get; set; }
    public Guid OwnerId { get; set; }
    public TOwner Owner { get; set; }
}

public class OrderPhoto : FileEntity<Order.OrderEntity>;
public class TruckPhoto : FileEntity<TruckEntity>;
public class UserAvatar : FileEntity<User>;