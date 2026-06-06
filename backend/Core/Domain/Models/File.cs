using System.Diagnostics.CodeAnalysis;
using Domain.Models.Abstract;
using Domain.Models.Truck;

namespace Domain.Models;

public abstract class FileEntity<TOwner> : CollectionEntity where TOwner : Entity
{
    public required string FilePath { get; set; }
    public Guid OwnerId { get; set; }
    public TOwner Owner { get; set; }
    
    
    [SetsRequiredMembers]
    public FileEntity()
    {
        FilePath = "";
        OwnerId = Guid.Empty;
    }
}

public class OrderFile : FileEntity<Order.OrderEntity>
{
    [SetsRequiredMembers]
    public OrderFile()
    {
    }
}

public class TruckFile : FileEntity<TruckEntity>
{
    [SetsRequiredMembers]
    public TruckFile()
    {
    }
}

public class UserFile : FileEntity<User>
{
    [SetsRequiredMembers]
    public UserFile()
    {
    }
}