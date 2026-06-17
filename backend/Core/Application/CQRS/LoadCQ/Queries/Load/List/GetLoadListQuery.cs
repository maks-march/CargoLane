using System.ComponentModel;
using Application.DTO.Load;
using Domain.Enums.Load;
using MediatR;

namespace Application.CQRS.LoadCQ.Queries.Load.List;

public record GetLoadListQuery : IRequest<LoadListVm[]>
{
    public string? SearchBy { get; set; }
    public string? StartCity { get; set; }
    public string? EndCity { get; set; }
    
    public DateOnly? FromDate { get; set; }
    public string? CargoType { get; set; }
    public string? VehicleType { get; set; }
    public double? Weight { get; set; }
    public double? Volume { get; set; }
    
    [DefaultValue("Active")]
    public string? Status { get; set; } = nameof(LoadStatus.Active);

    public SortChoices SortBy { get; set; } = SortChoices.PublicationDate;
    public bool IsDescending = false;
}

public enum SortChoices
{
    PublicationDate,
    Payment,
    MoveDate
}