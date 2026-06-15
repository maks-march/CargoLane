using Application.Interfaces.Auth;
using MediatR;

namespace Application.CQRS.AuthCQ.ResetPassword;

public class ResetPasswordCommandHandler(IIdentityService identityService)
    : IRequestHandler<ResetPasswordCommand, (bool Succeeded, string[] Errors)>
{
    public async Task<(bool Succeeded, string[] Errors)> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        return await identityService.ResetPasswordAsync(
            request.Email,
            request.Code,
            request.NewPassword);
    }
}