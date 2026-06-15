using Application.CQRS.AuthCQ.ConfirmEmail;
using MediatR;
using Application.Interfaces.Auth;

namespace Application.CQRS.AuthCQ;


public class ConfirmEmailCommandHandler(IIdentityService identityService) 
    : IRequestHandler<ConfirmEmailCommand, (bool Succeeded, string[] Errors)>
{
    public async Task<(bool Succeeded, string[] Errors)> Handle(ConfirmEmailCommand request, CancellationToken cancellationToken)
    {
        var confirm = await identityService.ConfirmEmailAsync(request.UserId, request.Token);
        if (!confirm.Succeeded)
        {
            throw new InvalidOperationException(string.Join('\n', confirm.Errors));
        }
        return confirm;
    }
}