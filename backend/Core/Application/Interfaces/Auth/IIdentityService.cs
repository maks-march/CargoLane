using Application.DTO.Auth;
using Domain.Models;

namespace Application.Interfaces.Auth;

public interface IIdentityService
{
    Task<(bool Succeeded, string[] Errors, Guid UserId)> CreateUserAsync(
        string userName, string password, string name, string surname);
        
    Task<User?> FindBusinessUserByIdAsync(Guid userId);
    
    Task<ApplicationUser?> FindUserByUsernameAsync(string userName);
    
    Task<(bool Succeeded, ApplicationUser? User)> CheckPasswordAsync(string userName, string password);

    Task<(bool Succeeded, string[] Errors)> ConfirmEmailAsync(Guid userId, string token);

    Task<(bool Succeeded, string[] Errors)> DeleteUser(Guid userId);

    Task<(bool Succeeded, string[] Errors, string? ResetToken)> GeneratePasswordResetTokenAsync(string email);

    Task<(bool Succeeded, string[] Errors)> ResetPasswordAsync(string email, string resetToken, string newPassword);

    Task<(bool Succeeded, string[] Errors)> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);

}