using Application.DTO.Auth;
using Application.Interfaces.Auth;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.CQRS.AuthCQ.Register;

public class RegisterCommandHandler(
    IIdentityService identityService,
    IJwtProvider jwtProvider,
    UserManager<ApplicationUser> userManager)
    : IRequestHandler<RegisterCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // 1. Создаем пользователя через наш сервис
        var (succeeded, errors, userId) = await identityService.CreateUserAsync(
            request.Login, request.Password, "", "");
        
        if (!succeeded)
        {
            throw new InvalidOperationException(string.Join("\n", errors));
        }
        
        // 2. Находим только что созданного пользователя, чтобы получить его данные
        var userDto = await identityService.FindUserByUsernameAsync(request.Login);
        if (userDto == null)
            throw new InvalidOperationException("Failed to find user after creation.");
        
        var appUser = await userManager.FindByIdAsync(userId.ToString());
        if (appUser == null) 
            throw new InvalidOperationException("Failed to find user after creation.");
        
        // 3. Генерируем токены
        var accessToken = jwtProvider.GenerateAccessToken(userDto);
        var refreshToken = jwtProvider.GenerateRefreshToken();

        
        // 4. Сохраняем Refresh Token в базу
        appUser.RefreshToken = refreshToken;
        appUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await userManager.UpdateAsync(appUser);
        
        // 5. Возвращаем ответ
        return new AuthResponse(
            accessToken, 
            refreshToken, 
            userId, 
            userDto.UserName!);
    }
}