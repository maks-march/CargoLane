using Domain.Enums.Load;
using Domain.Models.Abstract;

namespace Domain.Models.Load;

public class LoadEntity : HasAuthor, IManyFiles<LoadFile>
{
    public double Payment { get; set; }
    public double Insurance { get; set; }
    public string HScode { get; set; }
    public int Adr { get; set; } = 1;
    public double Distance { get; set; } = 0;
    public string Duration { get; set; } = "00:00:00";
    
    public string[] VehicleTypes { get; set; } = [];
    
    public string CargoType { get; set; } = string.Empty;
    
    public string About { get; set; } = string.Empty;
    
    public double TotalWeight { get; set; }
    public double TotalVolume { get; set; }
    public IList<LoadFile> Photos { get; set; } = [];
    public IList<RoutePoint<LoadEntity>> RoutePoints { get; set; } = [];
    public IList<Payload> Payloads { get; set; } = [];
    public LoadStatus Status { get; set; }
    
    public string ReviewerName  { get; set; } = string.Empty;
    public string RejectReason { get; set; } = string.Empty;
    public DateTime ReviewDate { get; set; } = DateTime.MinValue;
    
    public ICollection<User> UsersSaves { get; set; } = [];
}