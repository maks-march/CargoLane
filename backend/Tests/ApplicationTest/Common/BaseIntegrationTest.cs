using System.Net.Http.Headers;
using System.Net.Http.Json;
using Application.CQRS.AuthCQ;
using Application.CQRS.AuthCQ.Login;
using Application.CQRS.AuthCQ.Refresh;
using Application.CQRS.AuthCQ.Register;
using Application.DTO.Auth;
using Application.Interfaces;
using FluentAssertions;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using WebApi.DTO;

namespace ApplicationTest.Common;

[TestFixture]
public abstract class BaseIntegrationTest
{
    protected TestWebApplicationFactory<Program> _factory;
    protected HttpClient Client;
    protected IFileService FileService;
    protected IMediator Mediator;
    
    protected const string Password = "Password123!";
    protected string Login = "RequestAuthor@mail.ru";
    protected AuthResponse Tokens;

    [OneTimeSetUp]
    public void OneTimeSetUp()
    {
        _factory = new TestWebApplicationFactory<Program>();
        Client = _factory.CreateClient();
        Mediator = _factory.Services.GetService<IMediator>() ?? new MediatR.Mediator(_factory.Services);
        FileService = _factory.Services.GetService<IFileService>() 
            ?? throw new NullReferenceException("File service not found in DI");
        
        Tokens = Register(Login).Result!;
        Tokens.Should().NotBeNull();
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", Tokens.AccessToken);
    }
    
    protected async Task<AuthResponse> Register(string login)
    {
        var registerCommand = new RegisterCommand
        {
            Login = login,
            Password = Password
        };
        var registerResult = await Mediator.Send(registerCommand);
        var confirmCommand = new ConfirmEmailCommand(registerResult.Id, registerResult.Token);
        var confirmResult = await Mediator.Send(confirmCommand);
        
        var loginCommand = new LoginCommand
        {
            Login = login,
            Password = Password
        };
        var response = await Client.PostAsJsonAsync("/api/Auth/login", loginCommand);
        var result = await ExtractFromResponse<AuthResponse>(response);

        response.IsSuccessStatusCode.Should().BeTrue();
        result.Should().NotBeNull();
        return result;
    }
    
    protected async Task<AuthResponse?> Refresh(AuthResponse? authResponse)
    {
        var command = new RefreshCommand
        {
            AccessToken = authResponse!.AccessToken,
            RefreshToken = authResponse.RefreshToken,
        };
        var response = await Client.PostAsJsonAsync("/api/Auth/refresh", command);
        
        response.IsSuccessStatusCode.Should().BeTrue();
        return await response.Content.ReadFromJsonAsync<AuthResponse>();
    }
    
    protected static async Task<T?> ExtractFromResponse<T>(HttpResponseMessage response)
    {
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadFromJsonAsync<ErrorResponse>();
            Console.WriteLine(err);
        }
        response.IsSuccessStatusCode.Should().BeTrue();
        var result = await response.Content.ReadFromJsonAsync<T>();
        return result;
    }
    
    [OneTimeTearDown]
    public void OneTimeTearDown()
    {
        Client.Dispose();
        _factory.Dispose();
    }
}
