using Application.DTO.Auth;
using Application.Interfaces.Auth;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.CQRS.AuthCQ.Register;

public class RegisterCommandHandler(
    IIdentityService identityService,
    IJwtProvider jwtProvider,
    IEmailService emailService,
    UserManager<ApplicationUser> userManager)
    : IRequestHandler<RegisterCommand, RegisterResponse>
{
    public async Task<RegisterResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existingAppUser = await userManager.FindByEmailAsync(request.Login);
        if (existingAppUser != null && existingAppUser.EmailConfirmed)
            throw new InvalidOperationException("User already exists");
        
        if (existingAppUser != null)
            await identityService.DeleteUser(existingAppUser.Id);
        
        // 1. Создаем пользователя через наш сервис (используем Username из команды)
        var name = request.Username ?? string.Empty;
        var surname = string.Empty;
        var (succeeded, errors, userId) = await identityService.CreateUserAsync(
            request.Login, request.Password, name, surname);
        
        if (!succeeded)
        {
            throw new InvalidOperationException(string.Join("\n", errors));
        }
        
        
        var appUser = await userManager.FindByIdAsync(userId.ToString());
        if (appUser == null) 
            throw new InvalidOperationException("Failed to find user after creation.");
        
        appUser.Email = request.Login;
        var token = await userManager.GenerateEmailConfirmationTokenAsync(appUser);
        var sended = await emailService.SendConfirmationEmailAsync(
            request.Login, 
            userId, 
            token, 
            cancellationToken);
        if (!sended)
        {
            await identityService.DeleteUser(userId);
            throw new InvalidOperationException("Failed to send confirmation email.");
        }
        return new(true, userId, token);
        // // 3. Генерируем токены
        // var accessToken = jwtProvider.GenerateAccessToken(appUser);
        // var refreshToken = jwtProvider.GenerateRefreshToken();
        //
        //
        // // 4. Сохраняем Refresh Token в базу
        // appUser.RefreshToken = refreshToken;
        // appUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        // await userManager.UpdateAsync(appUser);
        //
        // // 5. Возвращаем ответ
        // return new AuthResponse(
        //     accessToken, 
        //     refreshToken, 
        //     userId, 
        //     appUser.Email);
    }
}