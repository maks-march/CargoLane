using Application.DTO.Auth;
using Application.Interfaces;
using Application.Interfaces.Auth;
using Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.CQRS.UserCQ.Commands.Create;

public class CreateUserCommandHandler(
    IAppDbContext dbContext,
    IIdentityService identityService,
    UserManager<ApplicationUser> userManager) 
    : IRequestHandler<CreateUserCommand, Guid>
{
    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var existingAppUser = await userManager.FindByEmailAsync(request.Login);
        if (existingAppUser != null)
            throw new InvalidOperationException("User already exists");
        
        // 1. Создаем пользователя через наш сервис (используем Username из команды)
        var name = request.DisplayName ?? string.Empty;
        var (succeeded, errors, userId) = await identityService.CreateUserAsync(
            request.Login, request.Password, request.Login, name);
        if (!succeeded)
        {
            throw new InvalidOperationException(string.Join("\n", errors));
        }
        
        var appUser = await userManager.FindByIdAsync(userId.ToString());
        if (appUser == null) 
            throw new InvalidOperationException("Failed to find user after creation.");
        
        await userManager.AddToRoleAsync(appUser, request.Role);
        appUser.Email = request.Login;
        appUser.EmailConfirmed = true;
        
        await dbContext.SaveChangesAsync(cancellationToken);
        return userId;
    }
}