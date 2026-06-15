using System.Diagnostics.CodeAnalysis;
using Domain.Models.Abstract;
using Domain.Models.Load;

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



public class LoadFile : FileEntity<LoadEntity>
{
    [SetsRequiredMembers]
    public LoadFile()
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
