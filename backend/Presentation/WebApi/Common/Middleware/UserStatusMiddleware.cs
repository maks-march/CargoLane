using Application.Common.Exceptions;
using Application.DTO.Auth;
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
            if (userId == null)
                throw new ForbiddenException("User not found", Guid.Empty);
            var user = await userManager.FindByIdAsync(userId);

            // Если пользователя нет или он заблокирован
            if (user == null || await userManager.IsLockedOutAsync(user))
            {
                throw new ForbiddenException("Account is deactivated or locked.", Guid.Empty);
            }
        }

        await _next(context);
    }
}