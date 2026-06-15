using Application.Common.Exceptions;
using Application.DTO.Auth;
using Application.Interfaces.Auth;
using Domain.Models;
using Microsoft.AspNetCore.Identity;
using Persistence.Common.DbContexts;

namespace Persistence.Common.Auth;

public class IdentityService(UserManager<ApplicationUser> userManager, AppDbContext context)
    : IIdentityService
{
    public async Task<(bool Succeeded, string[] Errors, Guid UserId)> CreateUserAsync(
        string userName, string password, string email, string name)
    {
        var appUser = new ApplicationUser { UserName = userName, Email = email };
        var result = await userManager.CreateAsync(appUser, password);

        if (!result.Succeeded)
            return (false, result.Errors.Select(e => e.Description).ToArray(), Guid.Empty);

        var businessUser = new User
        {
            Id = appUser.Id, 
            FirstName = name,
            DisplayName = name,
            Created = DateTime.UtcNow,
            Updated = DateTime.UtcNow
        };
        context.BusinessUsers.Add(businessUser);
        await context.SaveChangesAsync(CancellationToken.None);
        
        await userManager.AddToRoleAsync(appUser, "User");

        return (true, [], appUser.Id);
    }
    
    public async Task<User?> FindBusinessUserByIdAsync(Guid userId)
    {
        return await context.BusinessUsers.FindAsync(userId);
    }

    public async Task<(bool Succeeded, ApplicationUser? User)> CheckPasswordAsync(string userName, string password)
    {
        var appUser = await userManager.FindByNameAsync(userName);
        if (appUser == null)
            return (false, null);

        var success = await userManager.CheckPasswordAsync(appUser, password);
        if (!success)
            return (false, null);
        

        return (true, appUser);
    }

    public async Task<ApplicationUser?> FindUserByUsernameAsync(string userName)
    {
        var appUser = await userManager.FindByNameAsync(userName);
        if (appUser == null)
            return null;
        
        return appUser;
    }
    
    public async Task<(bool Succeeded, string[] Errors)> ConfirmEmailAsync(Guid userId, string token)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null) 
            return (false, ["User not found"]);

        var result = await userManager.ConfirmEmailAsync(user, token);
        return (result.Succeeded, result.Errors.Select(e => e.Description).ToArray());
    }

    public async Task<(bool Succeeded, string[] Errors)> DeleteUser(Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null) 
            return (false, ["User not found"]);
        
        var result = await userManager.DeleteAsync(user);
        return (result.Succeeded, result.Errors.Select(e => e.Description).ToArray());
    }

    public async Task<(bool Succeeded, string[] Errors)> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return (false, ["User not found"]);

        var result = await userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        return (result.Succeeded, result.Errors.Select(e => e.Description).ToArray());
    }

    public async Task<(bool Succeeded, string[] Errors, string? ResetToken)> GeneratePasswordResetTokenAsync(string email)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
            return (false, ["User not found"], null);

        // Use Identity's built-in reset token as the "code" for the frontend
        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        return (true, [], token);
    }

    public async Task<(bool Succeeded, string[] Errors)> ResetPasswordAsync(string email, string resetToken, string newPassword)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
            return (false, ["User not found"]);

        var result = await userManager.ResetPasswordAsync(user, resetToken, newPassword);
        return (result.Succeeded, result.Errors.Select(e => e.Description).ToArray());
    }
    
    public async Task<bool> DeactivateUserAsync(Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            throw new NotFoundException("User not found", userId);
        // Устанавливаем блокировку до конца времен (9999 год)
        var blocked = await userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
        
        await userManager.SetLockoutEnabledAsync(user, true);
        // Опционально: сбрасываем Security Stamp, чтобы пользователя выкинуло из системы мгновенно
        await userManager.UpdateSecurityStampAsync(user);
        return blocked.Succeeded;
    }
}