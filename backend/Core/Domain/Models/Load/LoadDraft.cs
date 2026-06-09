using Domain.Models.Abstract;
using Domain.Models.Order;

namespace Domain.Models.Load;

public class LoadDraft : HasAuthor
{
    public DateOnly? StartDate { get; set; } = null;
    
    public double? Payment { get; set; } = null;
    public double? Insurance { get; set; } = null;
    public string? HScode { get; set; } = null;
    public int? Adr { get; set; } = 1;
    public string[]? SuitableCargos { get; set; } = null;
    
    public string? About { get; set; } = null;
    public IList<RoutePoint<LoadDraft>>? RoutePoints { get; set; } = null;
    public IList<PayloadDraft>? Payloads { get; set; } = null;
}