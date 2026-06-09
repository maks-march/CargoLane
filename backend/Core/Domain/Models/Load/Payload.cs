using Domain.Enums;
using Domain.Enums.Load;
using Domain.Models.Abstract;
using Domain.Models.Order;

namespace Domain.Models.Load;

public class Payload : CollectionField<LoadEntity>
{
    public required double Length { get; set; } = 1;
    public required double Width { get; set; } = 1;
    public required double Height { get; set; } = 1;
    public required double Weight { get; set; } = 1;
    public required double Volume { get; set; } = 1;

    public int Amount { get; set; } = 1;
    public PayloadType Type { get; set; }
}

public class PayloadDraft : CollectionField<LoadDraft>
{
    public required double Length { get; set; } = 1;
    public required double Width { get; set; } = 1;
    public required double Height { get; set; } = 1;
    public required double Weight { get; set; } = 1;
    public required double Volume { get; set; } = 1;

    public int Amount { get; set; } = 1;
    public PayloadType Type { get; set; }
}