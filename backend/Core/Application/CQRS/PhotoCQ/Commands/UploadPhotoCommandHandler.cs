using Application.Interfaces;
using Domain.Models;
using Domain.Models.Abstract;

namespace Application.CQRS.PhotoCQ.Commands;

public class UploadPhotoCommandHandler<TOwner>(IAppDbContext dbContext) 
    where TOwner : Entity
{
    protected readonly IAppDbContext DbContext = dbContext;

    protected void UpdateCollection<TFile>(IList<TFile> fileCollection, string[] newList, TOwner owner)
        where TFile : FileEntity<TOwner>, new()
    {
        for (int i = fileCollection.Count - 1; i >= 0; i--)
        {
            var existing = fileCollection[i];
            if (i < newList.Length)
            {
                existing.FilePath = newList[i];
                existing.OrderIndex = i;
                existing.Updated = DateTime.Now;
            }
            else
            {
                DbContext.GetDbSet<TFile>().Remove(existing);
            }
        }
        
        if (newList.Length > fileCollection.Count)
        {
            for (int i = fileCollection.Count; i < newList.Length; i++)
            {
                var newFile = new TFile()
                {
                    Created = DateTime.Now,
                    Updated = DateTime.Now,
                    FilePath = newList[i],
                    OwnerId = owner.Id,
                    OrderIndex = i
                };
            
                fileCollection.Add(newFile);
            }
        }
    }
}
