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
        var confirmationLink = $"{configuration["AppBaseUrl"]}/confirm-email?userId={userId}&token={Uri.EscapeDataString(token)}";

        var htmlBody = $@"
        <html>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            </head>
            <body style='font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f7fc;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    
                    <!-- Карточка с содержимым -->
                    <div style='background-color: #ffffff; border-radius: 20px; padding: 40px 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);'>
                        
                        <!-- Логотип или заголовок CargoLane -->
                        <div style='text-align: center; margin-bottom: 30px;'>
                            <h1 style='color: #4f6ef7; font-size: 32px; margin: 0; letter-spacing: -0.5px;'>
                                CargoLane
                            </h1>
                            <p style='color: #6c757d; font-size: 14px; margin-top: 8px;'>Smart Logistics Solutions</p>
                        </div>
                        
                        <!-- Приветствие -->
                        <div style='text-align: center; margin-bottom: 25px;'>
                            <h2 style='color: #2c3e50; margin: 0 0 10px 0;'>Welcome to CargoLane! 🎉</h2>
                            <p style='color: #5a6e7f; font-size: 16px; margin: 0;'>We're excited to have you on board</p>
                        </div>
                        
                        <!-- Текст подтверждения -->
                        <p style='color: #333333; font-size: 15px; line-height: 1.6; margin-bottom: 25px; text-align: center;'>
                            Please confirm your email address to start using CargoLane services.
                        </p>
                        
                        <!-- Центрированная кнопка -->
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{confirmationLink}' 
                               style='display: inline-block;
                                      background-color: #4f6ef7;
                                      color: white;
                                      padding: 14px 32px;
                                      border-radius: 50px;
                                      font-size: 16px;
                                      font-weight: 600;
                                      text-decoration: none;
                                      text-align: center;
                                      transition: background-color 0.3s;'>
                               Confirm Email
                            </a>
                        </div>
                        
                        <!-- Альтернативная ссылка -->
                        <div style='border-top: 1px solid #e8ecf0; margin-top: 25px; padding-top: 20px;'>
                            <p style='color: #8895a3; font-size: 12px; margin-bottom: 8px; text-align: center;'>
                                Button not working? Copy and paste this link:
                            </p>
                            <p style='color: #4f6ef7; font-size: 12px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 8px; text-align: center;'>
                                {confirmationLink}
                            </p>
                        </div>
                        
                        <!-- Футер -->
                        <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8ecf0;'>
                            <p style='color: #a0aab5; font-size: 11px; margin: 0;'>
                                &copy; 2025 CargoLane. All rights reserved.<br>
                                Smart logistics for modern business
                            </p>
                        </div>
                        
                    </div>
                </div>
            </body>
        </html>";
        // if (_settings.IsDevelopment == "Development")
        // {
        //     return true;
        // }
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

    public async Task<bool> SendPasswordResetEmailAsync(string email, string resetToken, CancellationToken cancellationToken)
    {
        var resetLink = $"{configuration["AppBaseUrl"]}/reset-password?email={Uri.EscapeDataString(email)}&code={Uri.EscapeDataString(resetToken)}";

        var htmlBody = $@"
        <html>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            </head>
            <body style='font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f7fc;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <div style='background-color: #ffffff; border-radius: 20px; padding: 40px 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);'>
                        <div style='text-align: center; margin-bottom: 30px;'>
                            <h1 style='color: #4f6ef7; font-size: 32px; margin: 0; letter-spacing: -0.5px;'>CargoLane</h1>
                            <p style='color: #6c757d; font-size: 14px; margin-top: 8px;'>Smart Logistics Solutions</p>
                        </div>
                        <div style='text-align: center; margin-bottom: 25px;'>
                            <h2 style='color: #2c3e50; margin: 0 0 10px 0;'>Password Reset Request</h2>
                        </div>
                        <p style='color: #333333; font-size: 15px; line-height: 1.6; margin-bottom: 25px; text-align: center;'>
                            We received a request to reset your password. Use the button below to choose a new password.
                        </p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{resetLink}' 
                               style='display: inline-block; background-color: #4f6ef7; color: white; padding: 14px 32px; border-radius: 50px; font-size: 16px; font-weight: 600; text-decoration: none;'>
                               Reset Password
                            </a>
                        </div>
                        <div style='border-top: 1px solid #e8ecf0; margin-top: 25px; padding-top: 20px;'>
                            <p style='color: #8895a3; font-size: 12px; margin-bottom: 8px; text-align: center;'>
                                Or copy this link:
                            </p>
                            <p style='color: #4f6ef7; font-size: 12px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 8px; text-align: center;'>
                                {resetLink}
                            </p>
                        </div>
                        <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8ecf0;'>
                            <p style='color: #a0aab5; font-size: 11px; margin: 0;'>
                                &copy; 2025 CargoLane. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
        </html>";

        var emailMessage = new MimeMessage();
        emailMessage.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
        emailMessage.To.Add(new MailboxAddress("", email));
        emailMessage.Subject = "Reset your CargoLane password";
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