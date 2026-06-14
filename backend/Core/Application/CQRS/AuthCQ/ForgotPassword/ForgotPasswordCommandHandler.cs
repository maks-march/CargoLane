using Application.Interfaces.Auth;
using MediatR;

namespace Application.CQRS.AuthCQ.ForgotPassword;

public class ForgotPasswordCommandHandler(
    IIdentityService identityService,
    IEmailService emailService)
    : IRequestHandler<ForgotPasswordCommand, (bool Succeeded, string[] Errors)>
{
    public async Task<(bool Succeeded, string[] Errors)> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var (success, errors, resetToken) = await identityService.GeneratePasswordResetTokenAsync(request.Email);

        if (!success || string.IsNullOrEmpty(resetToken))
            return (true, Array.Empty<string>());
        // Send email with the token (frontend will use it as "code")
        var emailSent = await emailService.SendPasswordResetEmailAsync(request.Email, resetToken, cancellationToken);

        if (!emailSent)
            return (false, new[] { "Failed to send reset email" });

        return (true, Array.Empty<string>());
    }
}