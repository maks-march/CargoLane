using Application.Interfaces.Auth;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.CQRS.AuthCQ.ChangePassword;

public class ChangePasswordCommandHandler(
    IIdentityService identityService)
    : IRequestHandler<ChangePasswordCommand, (bool Succeeded, string[] Errors)>
{
    public async Task<(bool Succeeded, string[] Errors)> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        if (request.UserId == Guid.Empty)
            return (false, new[] { "User not authenticated" });

        return await identityService.ChangePasswordAsync(
            request.UserId,
            request.CurrentPassword,
            request.NewPassword);
    }
}