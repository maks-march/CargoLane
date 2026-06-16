using Application.DTO.Auth;
using Domain.Models;
using Domain.Models.Abstract;
using Domain.Models.Chat;
using Domain.Models.Load;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Application.Interfaces;

public interface IAppDbContext
{
    public DbSet<User> BusinessUsers { get; set; }
    
    public DbSet<ChatEntity> Chats { get; set; }
    public DbSet<ChatMessageEntity> Messages { get; set; }
    
    public DbSet<LoadEntity> Loads { get; set; }
    public DbSet<LoadDraft> LoadDrafts { get; set; }
    public DbSet<Payload> Payload { get; set; }
    public DbSet<PayloadDraft> PayloadDraft { get; set; }
    public DbSet<RoutePoint<LoadEntity>> RoutePoints { get; set; }
    public DbSet<RoutePoint<LoadDraft>> RoutePointsDraft { get; set; }
    public DbSet<ApplicationUser> Users { get; set; }
    public DbSet<UserFile> UserFiles { get; set; }

    public ChangeTracker ChangeTracker { get; }
    public DbSet<T> GetDbSet<T>() where T : class;
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}