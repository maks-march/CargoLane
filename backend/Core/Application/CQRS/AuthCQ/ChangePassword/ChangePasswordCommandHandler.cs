using Application.Common.Exceptions;
using Application.Interfaces.Auth;
using MediatR;

namespace Application.CQRS.AuthCQ.ChangePassword;

public class ChangePasswordCommandHandler(
    IIdentityService identityService)
    : IRequestHandler<ChangePasswordCommand, (bool Succeeded, string[] Errors)>
{
    public async Task<(bool Succeeded, string[] Errors)> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        if (request.UserId == Guid.Empty)
            throw new ForbiddenException("User not authorized", request.UserId);
        var result = await identityService.ChangePasswordAsync(
            request.UserId,
            request.CurrentPassword,
            request.NewPassword);
        if (!result.Succeeded)
            throw new InvalidOperationException("Change password failed");
        return result;
    }
}