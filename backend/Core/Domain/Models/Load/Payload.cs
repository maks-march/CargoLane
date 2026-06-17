using Domain.Models.Abstract;

namespace Domain.Models.Load;

public class Payload : CollectionField<LoadEntity>
{
    public required double Length { get; set; } = 0;
    public required double Width { get; set; } = 0;
    public required double Height { get; set; } = 0;
    public required double Weight { get; set; } = 0;
    public required double Volume { get; set; } = 0;

    public int Amount { get; set; } = 1;
    public string Type { get; set; }
}

public class PayloadDraft : CollectionField<LoadDraft>
{
    public double? Length { get; set; } = null;
    public double? Width { get; set; } = null;
    public double? Height { get; set; } = null;
    public double? Weight { get; set; } = null;

    public int? Amount { get; set; } = null;
    public string? Type { get; set; }
}