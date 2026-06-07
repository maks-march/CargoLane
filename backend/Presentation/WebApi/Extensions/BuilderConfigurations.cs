using DotNetEnv;
using Persistence.Common;

namespace WebApi.Extensions;

/// <summary>
/// Расширения для builder
/// </summary>
public static class BuilderConfigurations
{
    /// <summary>
    /// Подключение .env файла
    /// </summary>
    /// <param name="configBuilder"></param>
    /// <param name="configuration"></param>
    public static IConfigurationBuilder AddEnvironment(this IConfigurationBuilder configBuilder, IConfiguration configuration)
    {
        var envPath = configuration.GetSection(EnvKeys.EnvironmentPath).Value;
        var p = Directory.GetCurrentDirectory();
        if (File.Exists(envPath))
        {
            Env.Load(envPath);
            // Конфигурация с переопределением из .env
            var emailSettings = new
            {
                SmtpServer = Env.GetString("EMAIL_SMTP_SERVER"),
                Port = Env.GetInt("EMAIL_PORT"),
                SenderName = Env.GetString("EMAIL_SENDER_NAME"),
                SenderEmail = Env.GetString("EMAIL_SENDER_EMAIL"),
                Username = Env.GetString("EMAIL_USERNAME"),
                Password = Env.GetString("EMAIL_PASSWORD"),
                IsDevelopment = configuration.GetSection("Environment:Type").Value
            };

            // Добавляем в конфигурацию
            configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["EmailSettings:SmtpServer"] = emailSettings.SmtpServer,
                ["EmailSettings:Port"] = emailSettings.Port.ToString(),
                ["EmailSettings:SenderName"] = emailSettings.SenderName,
                ["EmailSettings:SenderEmail"] = emailSettings.SenderEmail,
                ["EmailSettings:Username"] = emailSettings.Username,
                ["EmailSettings:Password"] = emailSettings.Password,
                ["EmailSettings:IsDevelopment"] = emailSettings.IsDevelopment
            });
        }
        else
        {
            Console.WriteLine("Env file not found");
        }
        
        configBuilder.AddEnvironmentVariables();
        return configBuilder;
    }
}