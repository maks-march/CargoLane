namespace Application.Interfaces.Auth;

public interface IEmailService
{
    public Task<bool> SendConfirmationEmailAsync(string email, Guid userId, string token, CancellationToken cancellationToken);
}