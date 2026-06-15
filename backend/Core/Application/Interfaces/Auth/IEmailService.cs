namespace Application.Interfaces.Auth;

public interface IEmailService
{
    Task<bool> SendConfirmationEmailAsync(string email, Guid userId, string token, CancellationToken cancellationToken);

    Task<bool> SendPasswordResetEmailAsync(string email, string resetToken, CancellationToken cancellationToken);

}