using Application.DTO.Auth;
using Domain.Models;
using Microsoft.AspNetCore.Identity;
using WebApi.DTO;

namespace WebApi.Common.Middleware;

public class UserStatusMiddleware
{
    private readonly RequestDelegate _next;

    public UserStatusMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, UserManager<ApplicationUser> userManager)
    {
        // Проверяем только авторизованных пользователей
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userId = userManager.GetUserId(context.User);
            var user = await userManager.FindByIdAsync(userId);

            // Если пользователя нет или он заблокирован
            if (user == null || await userManager.IsLockedOutAsync(user))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new ErrorResponse()
                {
                    Details = "",
                    Error = "Account is deactivated or locked."
                });
                return;
            }
        }

        await _next(context);
    }
}