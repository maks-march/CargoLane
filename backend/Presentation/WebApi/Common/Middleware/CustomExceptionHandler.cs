using System.Net;
using System.Text.Json;
using Application.Common.Exceptions;
using AutoMapper;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using WebApi.DTO;

namespace WebApi.Common.Middleware;

/// <summary>
/// Обработчик исключений - выдает коды ошибок
/// </summary>
/// <param name="next"></param>
public class CustomExceptionHandler(RequestDelegate next)
{
    /// <summary>
    /// Оборачиваем вызов следующего middleware в try-catch
    /// </summary>
    /// <param name="context"></param>
    public async Task Invoke(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var code = HttpStatusCode.InternalServerError;
        var error = string.Empty;
        var details = string.Empty;
        switch (exception)
        {
            case ValidationException validationException:
                code = HttpStatusCode.BadRequest;
                error = validationException.Message;
                details = validationException.InnerException?.Message ?? "Validation exception.";
                break;
            case NotFoundException:
                code = HttpStatusCode.NotFound;
                break;
            case ForbiddenException:
                code = HttpStatusCode.Forbidden;
                break;
            case DbUpdateException dbUpdateException:
                code = HttpStatusCode.Conflict;
                error = dbUpdateException.Message;
                details = dbUpdateException.InnerException?.Message ?? "Database constraint violation.";
                break;
            case UnauthorizedAccessException unauthorizedAccessException:
                code = HttpStatusCode.Unauthorized;
                error = unauthorizedAccessException.Message;
                details = unauthorizedAccessException.InnerException?.Message ?? "Access denied.";
                break;
            case InvalidOperationException invalidOperationException:
                code = HttpStatusCode.BadRequest;
                error = invalidOperationException.Message;
                details = invalidOperationException.InnerException?.Message ?? "Invalid operation.";
                break;
            case OperationCanceledException operationCanceledException:
                code = HttpStatusCode.RequestTimeout;
                error = operationCanceledException.Message;
                details = operationCanceledException.InnerException?.Message ?? "Operation timed out.";
                break;
            case AutoMapperMappingException mappingException:
                code = HttpStatusCode.BadRequest;
                error = mappingException.Message;
                details = mappingException.InnerException?.Message ?? "Validation exception.";
                break;
        }
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code;
        if (error == string.Empty)
        {
            error = exception.Message; 
        }

        if (details == string.Empty)
        {
            details = exception.GetType().Name;
        }
        Console.WriteLine($"{error} \n {details}");
        return context.Response.WriteAsync(JsonSerializer.Serialize(new ErrorResponse()
        {
            Error = error, Details = details
        }));
    }
}