using Domain.Enums.Load;
using Domain.Models.Abstract;

namespace Domain.Models.Load;

public class LoadEntity : HasAuthor, IManyFiles<LoadFile>
{
    public double Payment { get; set; }
    public double Insurance { get; set; }
    public string HScode { get; set; }
    public int Adr { get; set; } = 1;
    public string[] SuitableCargos { get; set; } = [];
    
    public string About { get; set; } = string.Empty;
    public IList<LoadFile> Photos { get; set; } = [];
    public IList<RoutePoint<LoadEntity>> RoutePoints { get; set; } = [];
    public IList<Payload> Payloads { get; set; } = [];
    
    public LoadStatus Status { get; set; }
    public bool IsReviewed { get; set; } = false;
}