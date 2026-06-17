using Application.CQRS.LoadCQ.Queries.Load.List;

namespace Application.CQRS.LoadCQ.Queries.Load.Saved;

public record GetUserSavedQuery : GetLoadListQuery
{
    public Guid UserId { get; set; }
}