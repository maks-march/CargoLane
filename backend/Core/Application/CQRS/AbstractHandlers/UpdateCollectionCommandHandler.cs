using Application.Interfaces;
using AutoMapper;
using Domain.Models.Abstract;

namespace Application.CQRS.AbstractHandlers;

public abstract class UpdateCollectionCommandHandler(IAppDbContext dbContext, IMapper mapper)
{
    protected readonly IAppDbContext DbContext = dbContext;
    protected readonly IMapper Mapper = mapper;

    protected void UpdateCollection<TCollectionEntity, TRequestCollectionVm, TEntity>(IList<TCollectionEntity> orderCollection, IList<TRequestCollectionVm> newList, TEntity order) 
        where TCollectionEntity : CollectionField<TEntity> where TEntity : Entity
    {
        for (int i = orderCollection.Count - 1; i >= 0; i--)
        {
            var existing = orderCollection[i];
            if (i < newList.Count)
            {
                Mapper.Map(newList[i], existing);
                existing.OrderIndex = i;
            }
            else
            {
                DbContext.GetDbSet<TCollectionEntity>().Remove(existing);
            }
        }
        if (newList.Count > orderCollection.Count)
        {
            for (int i = orderCollection.Count; i < newList.Count; i++)
            {
                var dto = newList[i];
            
                var newPayload = Mapper.Map<TCollectionEntity>(dto);
                newPayload.EntityId = order.Id;
                newPayload.OrderIndex = i;
            
                orderCollection.Add(newPayload);
            }
        }
    }
}