using Application.CQRS.UserCQ.Commands.Create;
using Application.CQRS.UserCQ.Commands.Deactivate;
using Application.CQRS.UserCQ.Commands.Delete;
using Application.CQRS.UserCQ.Commands.DeleteAvatar;
using Application.CQRS.UserCQ.Commands.Update;
using Application.CQRS.UserCQ.Commands.UploadAvatar;
using Application.CQRS.UserCQ.Queries.GetUserDetails;
using Application.CQRS.UserCQ.Queries.GetUserList;
using Application.DTO.User;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.DTO;

namespace WebApi.Common.Controllers;

[Authorize]
public class UserController(IMediator mediator) : BaseController(mediator)
{
    #region old
    
    [HttpGet]
    public async Task<ActionResult<ICollection<UserDetailsVm>>> Get()
    {
        var query = new GetUserListQuery();
        var vm = await Mediator.Send(query);
        return Ok(vm);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Guid>> Post([FromBody] CreateUserCommand command)
        => Ok(await Mediator.Send(command));
    
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await Mediator.Send(new DeleteUserCommand { Id = id });
        return NoContent();
    }
    
    #endregion

    [HttpDelete("me")]
    public async Task<IActionResult> DeleteMe()
    {
        await Mediator.Send(new DeleteUserCommand { Id = UserId });
        return NoContent();
    }
    
    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDetailsVm>> Get(Guid id)
    {
        var query = new GetUserDetailsQuery { Id = id };
        var vm = await Mediator.Send(query);
        return Ok(vm);
    }
    
    [HttpGet("me")]
    public async Task<ActionResult<UserDetailsVm>> GetMe() => await Get(UserId);
    
    [HttpPatch("me")]
    public async Task<ActionResult<Guid>> UpdateMe([FromBody] UpdateUserCommand command)
    {
        if (UserId == Guid.Empty) return Unauthorized();
        command.Id = UserId;
        return Ok(await Mediator.Send(command));
    }
    
    [Authorize]
    [HttpPost("deactivate")]
    public async Task<ActionResult> Deactivate()
    {
        await Mediator.Send(new DeactivateCommand(UserId));
        return Ok();
    }

    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar([FromForm] PhotoDto avatar)
    {
        if (UserId == Guid.Empty) return Unauthorized();

        await Mediator.Send(new UploadUserAvatarCommand { UserId = UserId, Avatar = avatar.Photo });
        return NoContent();
    }

    [HttpDelete("avatar")]
    public async Task<IActionResult> DeleteAvatar()
    {
        if (UserId == Guid.Empty) return Unauthorized();
        await Mediator.Send(new DeleteUserAvatarCommand(UserId));
        return NoContent();
    }
}