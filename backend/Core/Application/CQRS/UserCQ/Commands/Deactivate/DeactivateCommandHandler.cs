using Application.Interfaces.Auth;
using MediatR;

namespace Application.CQRS.UserCQ.Commands.Deactivate;

public class DeactivateCommandHandler(IIdentityService identityService) : IRequestHandler<DeactivateCommand, bool>
{
    public async Task<bool> Handle(DeactivateCommand request, CancellationToken cancellationToken)
    {
        return await identityService.DeactivateUserAsync(request.UserId);
    }
}