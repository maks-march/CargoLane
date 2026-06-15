using Application.DTO.Auth;
using Application.Interfaces.Auth;
using Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.JsonWebTokens;

namespace Application.CQRS.AuthCQ.Refresh;

public class RefreshCommandHandler(UserManager<ApplicationUser> userManager, IJwtProvider jwtProvider)
    : IRequestHandler<RefreshCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(RefreshCommand request, CancellationToken cancellationToken)
    {
        // 1. Извлекаем данные пользователя из СТАРОГО, ИСТЕКШЕГО Access Token
        var principal = jwtProvider.GetPrincipalFromExpiredToken(request.AccessToken);
        
        var userName = principal?.Identity?.Name ?? principal?.FindFirst(JwtRegisteredClaimNames.Name)?.Value;
        if (userName is null)
        {
            throw new UnauthorizedAccessException("Invalid access token or refresh token.");
        }

        // 2. Находим пользователя в базе по имени из токена
        var user = await userManager.FindByNameAsync(userName);

        // 3. Проверяем, что Refresh Token совпадает и не истек
        if (user is null || user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid access token or refresh token.");
        }

        // 4. Генерируем НОВУЮ пару токенов
        var newAccessToken = jwtProvider.GenerateAccessToken(user);
        var newRefreshToken = jwtProvider.GenerateRefreshToken();

        // 5. Обновляем Refresh Token в базе (Token Rotation)
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await userManager.UpdateAsync(user);

        // 6. Возвращаем новую пару токенов клиенту (включая роль)
        var role = userManager.GetRolesAsync(user).Result.ToHighRole();
        return new AuthResponse(newAccessToken, newRefreshToken, user.Id, user.UserName, role);
    }
}