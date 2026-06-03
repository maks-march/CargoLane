namespace Domain.Models.Abstract;

public abstract class CollectionField<T> : EntityField<T>, ICollectionField where T : Entity
{
    public required int OrderIndex { get; set; }
}