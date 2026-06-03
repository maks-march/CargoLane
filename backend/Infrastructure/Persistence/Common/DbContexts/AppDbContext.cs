using Application.DTO.Auth;
using Application.Interfaces;
using Domain.Models;
using Domain.Models.Abstract;
using Domain.Models.Order;
using Domain.Models.Truck;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Persistence.Common.EntityTypeConfigurations;
using Persistence.Common.EntityTypeConfigurations.Order;

namespace Persistence.Common.DbContexts;

public class AppDbContext 
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>, IAppDbContext
{
    public DbSet<User> BusinessUsers { get; set; }
    public DbSet<TruckEntity> Trucks { get; set; }
    public DbSet<OrderEntity> Orders { get; set; }
    public DbSet<Payload> Payloads { get; set; }
    public DbSet<RoutePoint<OrderEntity>> OrderRoutePoints { get; set; }
    public DbSet<RoutePoint<TruckEntity>> TruckRoutePoints { get; set; }
    public DbSet<Transport> Transports { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<OrderPhoto> Files { get; set; }
    
    public DbSet<T> GetDbSet<T>() where T : class
    {
        return Set<T>();
    }

    public AppDbContext(DbContextOptions<AppDbContext> options) 
        : base(options) { }
    
    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfiguration(new UserConfiguration());
        builder.ApplyConfiguration(new TruckConfiguration());
        builder.ApplyConfiguration(new OrderConfiguration());
        builder.ApplyConfiguration(new PayloadConfiguration());
        builder.ApplyConfiguration(new OrderRoutePointsConfiguration());
        builder.ApplyConfiguration(new TransportConfiguration());
        builder.ApplyConfiguration(new PaymentConfiguration());
        builder.ApplyConfiguration(new FileConfiguration<OrderEntity>());
        
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