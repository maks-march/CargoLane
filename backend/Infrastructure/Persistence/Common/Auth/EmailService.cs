using Application.Interfaces.Auth;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;

namespace Persistence.Common.Auth;

public class EmailService(IOptions<EmailSettings> settings, IConfiguration configuration) : IEmailService
{
    private readonly EmailSettings _settings = settings.Value;

    public async Task<bool> SendConfirmationEmailAsync(string email, Guid userId, string token, CancellationToken cancellationToken)
    {
        var confirmationLink = $"{configuration["AppBaseUrl"]}/api/auth/confirm?userId={userId}&token={Uri.EscapeDataString(token)}";

        var htmlBody = $@"
            <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2>Welcome to our application!</h2>
                    <p>Please confirm your email by clicking the button below:</p>
                    <a href='{confirmationLink}' 
                       style='background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                       Confirm Email
                    </a>
                    <p>If the button doesn't work, copy and paste this link into your browser: <br/> {confirmationLink}</p>
                </body>
            </html>";
        
        if (_settings.IsDevelopment == "Development")
        {
            return true;
        }
        var emailMessage = new MimeMessage();
        emailMessage.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
        emailMessage.To.Add(new MailboxAddress("", email));
        emailMessage.Subject = "Email Confirmation";
        emailMessage.Body = new TextPart(TextFormat.Html) { Text = htmlBody };

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(_settings.SmtpServer, _settings.Port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_settings.Username, _settings.Password);
            await client.SendAsync(emailMessage);
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return false;
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
        return true;
    }
}