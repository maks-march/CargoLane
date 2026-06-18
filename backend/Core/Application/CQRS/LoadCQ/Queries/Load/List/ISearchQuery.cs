namespace Application.CQRS.LoadCQ.Queries.Load.List;

public interface ISearchQuery
{
    public string? SearchBy { get; init; }
}