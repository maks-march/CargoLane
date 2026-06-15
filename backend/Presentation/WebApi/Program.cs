using Application;
using Application.Common.Services;
using Microsoft.AspNetCore.HttpOverrides;
using Persistence.Extensions;
using WebApi.Common.Middleware;
using WebApi.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironment(builder.Configuration);
builder.Services
    .AddPersistenceServices(builder.Configuration)
    .AddApplicationServices()
    .AddWebApiServices();



// Доверяем только Nginx?
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

app.UseCustomExceptionHandler();
app.UseStaticAssets(builder.Environment);
app.UseCors("AllowFrontend");
app.UseRouting();

app.MapHub<ChatHub>("/chathub");

app.UseStatusCodePages();
app.UseForwardedHeaders();

if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API V1");
        c.InjectJavascript("/api/files/swagger/swagger-auth.js");
    });
}

app.ApplyMigrations();
await app.SeedData();

app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<UserStatusMiddleware>();
app.MapControllers();

app.Run();