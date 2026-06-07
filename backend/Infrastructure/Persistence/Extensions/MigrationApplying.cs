using Application.DTO.Auth;
using Application.Interfaces;
using Domain.Enums;
using Domain.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Persistence.Common.DbContexts;

namespace Persistence.Extensions;

public static class MigrationApplying
{
    public static IServiceProvider ApplyMigrations(this IServiceProvider serviceProvider)
    {
        var dbContext = serviceProvider.GetRequiredService<AppDbContext>();
        // dbContext.Database.EnsureCreated();
        dbContext.Database.Migrate();
        return serviceProvider;
    }
    
    public static IServiceProvider ApplyMigrationsSqlite(this IServiceProvider serviceProvider)
    {
        var dbContext = serviceProvider.GetRequiredService<AppDbContext>();
        // dbContext.Database.EnsureDeleted();
        dbContext.Database.EnsureCreated();
        return serviceProvider;
    }
    
    public static async Task CreateRoles(this IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    
        string[] roles = { "Admin", "Manager", "User" };
        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
            }
        }
    }
    
    public static async Task SeedAdminUserAsync(this IServiceProvider serviceProvider, IConfiguration configuration)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        var adminUserName = configuration["Admin:Login"]!;
        var adminUser = await userManager.FindByNameAsync(adminUserName);

        if (adminUser == null)
        {
            var newAdminUser = new ApplicationUser
            {
                Email = configuration["Admin:Email"],
                UserName = adminUserName
            };
            newAdminUser.EmailConfirmed = true;
            var adminPassword = configuration["Admin:Password"]; 
            var result = await userManager.CreateAsync(newAdminUser, adminPassword!);

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(newAdminUser, RoleMapping.Admin);

                var dbContext = serviceProvider.GetRequiredService<IAppDbContext>();
                var businessUser = new User
                {
                    Id = newAdminUser.Id,
                    FirstName = configuration["Admin:Name"]!,
                    LastName = configuration["Admin:Surname"]!,
                    Created = DateTime.UtcNow,
                    Updated = DateTime.UtcNow,
                };
                dbContext.BusinessUsers.Add(businessUser);
                await dbContext.SaveChangesAsync(CancellationToken.None);
            }
            else
            {
                throw new InvalidOperationException(
                    string.Join(";\n",
                        result.Errors.Select(err => err.Description).ToArray())
                );
            }
        }
    }
}