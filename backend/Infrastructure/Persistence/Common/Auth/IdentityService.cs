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
        string userName, string password, string name, string surname)
    {
        var appUser = new ApplicationUser { UserName = userName, Email = userName };
        var result = await userManager.CreateAsync(appUser, password);

        if (!result.Succeeded)
            return (false, result.Errors.Select(e => e.Description).ToArray(), Guid.Empty);

        var businessUser = new User
        {
            Id = appUser.Id, 
            FirstName = name, 
            LastName = surname,
            Created = DateTime.Now,
            Updated = DateTime.Now
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
}