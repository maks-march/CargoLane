using Application.DTO.Auth;
using Application.Interfaces;
using Domain.Models;
using Domain.Models.Chat;
using Domain.Models.Load;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Persistence.Common.EntityTypeConfigurations;
using Persistence.Common.EntityTypeConfigurations.Chat;
using Persistence.Common.EntityTypeConfigurations.Load;

namespace Persistence.Common.DbContexts;

public class AppDbContext 
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>, IAppDbContext
{
    public DbSet<User> BusinessUsers { get; set; }
    
    public DbSet<ChatEntity> Chats { get; set; }
    public DbSet<ChatMessageEntity> Messages { get; set; }
    
    public DbSet<LoadEntity> Loads { get; set; }
    public DbSet<LoadDraft> LoadDrafts { get; set; }
    public DbSet<Payload> Payload { get; set; }
    public DbSet<PayloadDraft> PayloadDraft { get; set; }
    
    
    public DbSet<UserFile> UserFiles { get; set; }
    
    public DbSet<T> GetDbSet<T>() where T : class
    {
        return Set<T>();
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    { }
    
    protected override void OnModelCreating(ModelBuilder builder)
    {
        
        builder.ApplyConfiguration(new FileConfiguration<User>());
        builder.ApplyConfiguration(new FileConfiguration<LoadEntity>());
        
        builder.ApplyConfiguration(new UserConfiguration());
        
        builder.ApplyConfiguration(new ChatConfiguration());
        builder.ApplyConfiguration(new ChatMessageConfiguration());
        
        builder.ApplyConfiguration(new LoadConfiguration());
        
        builder.ApplyConfiguration(new LoadDraftConfiguration());
        builder.ApplyConfiguration(new PayloadDraftConfiguration());
        base.OnModelCreating(builder);
    }
    
    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder
            .Properties<DateTime>()
            .HaveConversion<UtcDateTimeConverter>();

        base.ConfigureConventions(configurationBuilder);
    }
}