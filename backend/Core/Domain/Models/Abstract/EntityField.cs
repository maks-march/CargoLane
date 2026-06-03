namespace Domain.Models.Abstract;

public abstract class EntityField<T> : BaseEntity where T : Entity
{
    public Guid EntityId { get; set; }
    public T Entity { get; set; }
}