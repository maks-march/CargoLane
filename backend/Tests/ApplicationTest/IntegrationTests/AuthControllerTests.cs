using System.Net.Http.Json;
using Application.CQRS.AuthCQ.Login;
using Application.CQRS.AuthCQ.Refresh;
using Application.DTO.Auth;
using ApplicationTest.Common;
using FluentAssertions;

namespace ApplicationTest.IntegrationTests;

public class AuthControllerTests : BaseIntegrationTest
{
    [Test]
    public async Task Register_WithInvalidData_ShouldBeValidationError()
    {
        var login = "Register_WithInvalidData_ShouldBeValidationError";
        var act = async () => await Register(login);
        await act.Should().ThrowAsync();
    }
    
    [Test]
    public async Task Login_WithValidCredentials_ShouldReturnAuthResponse()
    {
        var login = "Login_WithValidCredentials_ShouldReturnAuthResponse@gmail.com";
        await Register(login);
        
        var loginCommand = new LoginCommand
        {
            Login = login,
            Password = Password
        };
        
        var response = await Client.PostAsJsonAsync("/api/Auth/login", loginCommand);
        
        response.IsSuccessStatusCode.Should().BeTrue();

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        authResponse.Should().NotBeNull();
        authResponse.AccessToken.Should().NotBeNullOrEmpty();
        authResponse.RefreshToken.Should().NotBeNullOrEmpty();
        Refresh(authResponse).Result.Should().NotBeNull();
    }
    
    [Test]
    public async Task Login_WithInvalidCredentials_ShouldReturnUnauthorized()
    {
        var loginCommand = new LoginCommand
        {
            Login = "nonexistent@user.com",
            Password = "wrong-password"
        };
        
        var response = await Client.PostAsJsonAsync("/api/Auth/login", loginCommand);
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }
    
    [Test]
    public async Task Login_WithInvalidPassword_ShouldReturnUnauthorized()
    {
        var login = "Login_WithInvalidPassword_ShouldReturnUnauthorized@gmail.com";
        await Register(login);
        
        var loginCommand = new LoginCommand
        {
            Login = login,
            Password = "wrong-password"
        };
        
        var response = await Client.PostAsJsonAsync("/api/Auth/login", loginCommand);
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }

    [Test]
    public async Task Refresh_WithValidCredentials_ShouldReturnAuthResponse()
    {
        var login = "Refresh_WithValidCredentials_ShouldReturnAuthResponse@gmail.com";
        var authResponse = await Register(login);
        
        var response = await Refresh(authResponse);
        
        response.Should().NotBeNull();
        response.AccessToken.Should().NotBeNullOrEmpty();
        response.RefreshToken.Should().NotBeNullOrEmpty();
        response.UserName.Should().Be(login);
        Refresh(response).Result.Should().NotBeNull();
    }
    
    [Test]
    public async Task Refresh_WithInvalidCredentials_ShouldReturnUnauthorized()
    {
        var login = "Refresh_WithInvalidAccessToken_ShouldReturnUnauthorized@gmail.com";
        var authResponse = await Register(login);
        
        var refreshCommandInvalidAccess = new RefreshCommand
        {
            AccessToken = authResponse!.AccessToken.Substring(0, authResponse.AccessToken.Length / 2),
            RefreshToken = authResponse.RefreshToken
        };
        var refreshCommandInvalidRefresh = new RefreshCommand
        {
            AccessToken = authResponse.AccessToken,
            RefreshToken = authResponse.RefreshToken.Substring(0, authResponse.RefreshToken.Length / 2)
        };
        
        var responseInvalidAccess = await Client.PostAsJsonAsync("/api/Auth/refresh", refreshCommandInvalidAccess);
        var responseInvalidRefresh = await Client.PostAsJsonAsync("/api/Auth/refresh", refreshCommandInvalidRefresh);
        
        responseInvalidAccess.IsSuccessStatusCode.Should().BeFalse();
        responseInvalidAccess.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
        responseInvalidRefresh.IsSuccessStatusCode.Should().BeFalse();
        responseInvalidRefresh.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
    }
    
    [Test]
    public async Task Refresh_WithOthersTokens_ShouldReturnUnauthorized()
    {
        var login = "Refresh_WithOthersTokens_ShouldReturnUnauthorized@gmail.com";
        var authResponse = await Register(login);
        var authResponse2 = await Register("2" + login);
        
        var refreshCommand = new RefreshCommand
        {
            AccessToken = authResponse!.AccessToken,
            RefreshToken = authResponse2!.RefreshToken
        };
        var refreshCommand2 = new RefreshCommand
        {
            AccessToken = authResponse2.AccessToken,
            RefreshToken = authResponse.RefreshToken
        };
        
        var response = await Client.PostAsJsonAsync("/api/Auth/refresh", refreshCommand);
        var response2 = await Client.PostAsJsonAsync("/api/Auth/refresh", refreshCommand2);
        
        response.IsSuccessStatusCode.Should().BeFalse();
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
        response2.IsSuccessStatusCode.Should().BeFalse();
        response2.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
    }
}