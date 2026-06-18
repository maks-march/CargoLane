using System.Reflection;
using Application.Common.Mappings;
using Application.DTO.Attributes;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.OpenApi;
using WebApi.Common.Services;

namespace WebApi.Extensions;

/// <summary>
/// Инъекция зависимостей WebApi
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Инъекция сервисов из WebApi
    /// </summary>
    /// <param name="services"></param>
    /// <param name="configuration"></param>
    public static IServiceCollection AddWebApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        return services
            .AddServices()
            .AddConfiguredAutoMapper()
            .AddConfiguredControllers()
            .AddEndpointsApiExplorer()
            .AddConfiguredSwaggerGen()
            .AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    var origins = configuration.GetSection("AllowedOrigins").Get<string[]>()
                                  ?? new[] { "http://localhost:5173" };
        
                    policy.WithOrigins(origins)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });
    }

    private static IServiceCollection AddServices(this IServiceCollection services)
    {
        return services.AddScoped<IFileService, FileService>();
    }
    
    private static IServiceCollection AddConfiguredSwaggerGen(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Version = "v1",
                Title = "CargoLane API",
                Description = "API для управления логистикой и грузоперевозками. " +
                              "Позволяет регистрировать пользователей, создавать заказы и управлять транспортными средствами.",
                // Contact = new OpenApiContact
                // {
                //     Name = "Support Team",
                //     Email = "support@euroroute.com"
                // },
                // License = new OpenApiLicense
                // {
                //     Name = "Use under MIT License",
                //     Url = new Uri("https://example.com/license")
                // }
            });
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter JWT token like: Bearer {token}"
            });
            options.AddSecurityRequirement(document =>
            {
                OpenApiSecuritySchemeReference schemeRef = new("Bearer", document);
                OpenApiSecurityRequirement requirement = new()
                {
                    [schemeRef] = []
                };
                return requirement;
            });
            options.EnableAnnotations();
            options.SchemaFilter<JsonDefaultFilter>();
            // Получаем путь к XML-файлу, сгенерированному для WebApi
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            options.IncludeXmlComments(xmlPath);
    
            // (Опционально) Если твои DTO и команды с комментариями лежат в Application
            var appXmlFile = "Application.xml";
            var appXmlPath = Path.Combine(AppContext.BaseDirectory, appXmlFile);
            if (File.Exists(appXmlPath))
            {
                options.IncludeXmlComments(appXmlPath);
            }
        });
        return services;
    }
    
    
    private static IServiceCollection AddConfiguredAutoMapper(this IServiceCollection services)
    {
        services.AddAutoMapper(config =>
        {
            config.AddProfile(
                new AssemblyMappingProfile(
                    typeof(DependencyInjection).Assembly,
                    typeof(Persistence.Extensions.DependencyInjection).Assembly,
                    typeof(Application.DependencyInjection).Assembly
                    )
                );
        });
        return services;
    }
    
    private static IServiceCollection AddConfiguredControllers(this IServiceCollection services)
    {
        services.AddControllers(options =>
        {
            // Конвертируем названия controller и action
            options.Conventions.Add(new RouteTokenTransformerConvention(new LowercaseSlugParameterTransformer()));
        });
        return services;
    }

    private class LowercaseSlugParameterTransformer : IOutboundParameterTransformer
    {
        public string? TransformOutbound(object? value)
        {
            return value?.ToString()?.ToLowerInvariant();
        }
    }
}