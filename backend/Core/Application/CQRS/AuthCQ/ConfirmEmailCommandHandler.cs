using MediatR;
using Application.Interfaces.Auth;

namespace Application.CQRS.AuthCQ;


public class ConfirmEmailCommandHandler(IIdentityService identityService) 
    : IRequestHandler<ConfirmEmailCommand, (bool Succeeded, string[] Errors)>
{
    public async Task<(bool Succeeded, string[] Errors)> Handle(ConfirmEmailCommand request, CancellationToken cancellationToken)
    {
        var confirm = await identityService.ConfirmEmailAsync(request.UserId, request.Token);
        return confirm;
    }
}