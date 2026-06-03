namespace Domain.Models.Abstract;

public abstract class CollectionEntity : Entity, ICollectionField
{
    public required int OrderIndex { get; set; }
}

public interface ICollectionField
{
    public int OrderIndex { get; set; }
}