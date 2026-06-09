using MediatR;

namespace Application.CQRS.LoadCQ.Commands;

public record CreateLoadCommand : IRequest<Guid>
{
    public Guid UserId { get; set; } // Из контроллера
    
    public DateOnly StartDate { get; set; }
    public double Payment { get; set; }
    public double Insurance { get; set; }
    public string HScode { get; set; } = string.Empty;
    public int Adr { get; set; }
    public string[] SuitableCargos { get; set; } = [];
    public string About { get; set; } = string.Empty;

    public List<PayloadInputDto> Payloads { get; set; } = [];
    public List<RoutePointInputDto> RoutePoints { get; set; } = [];
}

public record PayloadInputDto
{
    public double Length { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }
    public double Weight { get; set; }
    public double Volume { get; set; }
    public int Amount { get; set; }
    public string Type { get; set; } = string.Empty;
}

public record RoutePointInputDto
{
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateTime? ArrivalTime { get; set; }
    public int OrderIndex { get; set; }
}