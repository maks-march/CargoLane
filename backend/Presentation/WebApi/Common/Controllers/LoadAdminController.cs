using Application.CQRS.AdminCQ.Commands;
using Application.CQRS.AdminCQ.Queries;
using Application.DTO.Load;
using Domain.Enums.Load;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.Common.Controllers.Abstract;

namespace WebApi.Common.Controllers;

[Authorize(Roles = "Admin")]
public class LoadAdminController(IMediator mediator) : BaseLoadController(mediator)
{
    [HttpGet("reviews")]
    public async Task<ActionResult<LoadListVm[]>> GetReviews()
    {
        var query = new GetReviewsQuery(LoadStatus.Pending);
        return Ok(
            ChangeListVmForUser(
                await Mediator.Send(query)
            )
        );
    }
    
    [HttpGet("{id:guid}/review")]
    public async Task<ActionResult<LoadDetailsVm>> GetReview(Guid id)
    {
        var query = new GetReviewQuery(id);
        return Ok(
            ChangeVmForUser(
                await Mediator.Send(query)
            )
        );
    }
    
    [HttpGet("approved")]
    public async Task<ActionResult<LoadListVm[]>> GetApproved()
    {
        var query = new GetReviewsQuery(null);
        return Ok(
            ChangeListVmForUser(
                await Mediator.Send(query)
            )
        );
    }
    
    [HttpGet("rejected")]
    public async Task<ActionResult<LoadListVm[]>> GetRejected()
    {
        var query = new GetReviewsQuery(LoadStatus.Rejected);
        return Ok(
            ChangeListVmForUser(
                await Mediator.Send(query)
            )
        );
    }
    
    [HttpPost("{id:guid}/approve")]
    public async Task<ActionResult<Guid>> Approve(Guid id)
    {
        var command = new ChangeLoadStatus(id, UserId, LoadStatus.Active);
        return Ok(await Mediator.Send(command));
    }
    
    [HttpPost("{id:guid}/reject")]
    public async Task<ActionResult<Guid>> Reject(Guid id, [FromBody] string reason)
    {
        var command = new ChangeLoadStatus(id, UserId, LoadStatus.Rejected, reason);
        return Ok(await Mediator.Send(command));
    }
}