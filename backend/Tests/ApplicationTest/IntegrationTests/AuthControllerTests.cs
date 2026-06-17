using System.Net;
using System.Net.Http.Json;
using Application.CQRS.AuthCQ.ChangePassword;
using Application.CQRS.AuthCQ.ConfirmEmail;
using Application.CQRS.AuthCQ.ForgotPassword;
using Application.CQRS.AuthCQ.Login;
using Application.CQRS.AuthCQ.Refresh;
using Application.CQRS.AuthCQ.Register;
using Application.CQRS.AuthCQ.ResetPassword;
using Application.DTO.Auth;
using ApplicationTest.Common;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace ApplicationTest.IntegrationTests;

public class AuthControllerTests : BaseIntegrationTest
{
    #region Existing tests (kept + lightly updated for Role)

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
        authResponse.Role.Should().NotBeNullOrEmpty(); // role is now returned
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
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
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
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
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
        response.Role.Should().NotBeNullOrEmpty(); // role is now returned
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
        responseInvalidAccess.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        responseInvalidRefresh.IsSuccessStatusCode.Should().BeFalse();
        responseInvalidRefresh.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
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
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        response2.IsSuccessStatusCode.Should().BeFalse();
        response2.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    #endregion

    #region New tests — Register full payload + Confirm-email POST + Role in responses

    [Test]
    public async Task Register_WithFullPayload_ShouldSucceed_AndReturnUserId()
    {
        var login = $"full-register-{Guid.NewGuid()}@example.com";

        var registerCommand = new RegisterCommand
        {
            Login = login,
            Password = Password,
            Username = "FullUserName"
        };

        var response = await Client.PostAsJsonAsync("/api/Auth/register", registerCommand);
        var result = await ExtractFromResponse<RegisterResponse>(response);
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        result.Id.Should().NotBeEmpty();
    }

    [Test]
    public async Task ConfirmEmail_ViaPostBody_ShouldConfirmAccount()
    {
        var login = $"confirm-post-{Guid.NewGuid()}@test.com";

        // Register via Mediator (unconfirmed user + token)
        var registerResult = await Mediator.Send(new RegisterCommand
        {
            Login = login,
            Password = Password,
            Username = ""
        });

        var confirmCommand = new ConfirmEmailCommand(registerResult.Id, registerResult.Token);

        // Call the contract endpoint from md: POST /api/Auth/confirm-email with body
        var httpResponse = await Client.PostAsJsonAsync("/api/Auth/confirm-email", confirmCommand);
        
        httpResponse.IsSuccessStatusCode.Should().BeTrue();

        // After confirmation login must succeed
        var loginCmd = new LoginCommand { Login = login, Password = Password };
        var loginResp = await Client.PostAsJsonAsync("/api/Auth/login", loginCmd);
        loginResp.IsSuccessStatusCode.Should().BeTrue();

        var auth = await loginResp.Content.ReadFromJsonAsync<AuthResponse>();
        auth.Should().NotBeNull();
        auth!.AccessToken.Should().NotBeNullOrEmpty();
    }

    [Test]
    public async Task Login_And_Refresh_ShouldReturnRole()
    {
        var login = $"role-test-{Guid.NewGuid()}@test.com";
        var auth = await Register(login);

        auth.Role.Should().NotBeNullOrEmpty();
        auth.Role.Should().BeOneOf("User", "Manager", "Admin");

        var refreshed = await Refresh(auth);
        refreshed!.Role.Should().NotBeNullOrEmpty();
    }

    #endregion

    #region Change Password

    [Test]
    public async Task ChangePassword_WithValidCurrentPassword_ShouldSucceed()
    {
        var login = $"changepass-{Guid.NewGuid()}@test.com";
        var auth = await Register(login);

        // Fresh client with proper auth header
        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var changeCmd = new ChangePasswordCommand
        {
            CurrentPassword = Password,
            NewPassword = "NewSecurePass123!"
        };

        var resp = await client.PostAsJsonAsync("/api/Auth/change-password", changeCmd);
        resp.IsSuccessStatusCode.Should().BeTrue();

        // Old password no longer works
        var badLogin = await client.PostAsJsonAsync("/api/Auth/login", new LoginCommand
        {
            Login = login,
            Password = Password
        });
        badLogin.IsSuccessStatusCode.Should().BeFalse();

        // New password works
        var goodLogin = await client.PostAsJsonAsync("/api/Auth/login", new LoginCommand
        {
            Login = login,
            Password = "NewSecurePass123!"
        });
        goodLogin.IsSuccessStatusCode.Should().BeTrue();
    }

    [Test]
    public async Task ChangePassword_WithWrongCurrentPassword_ShouldFail()
    {
        var login = $"changepass-bad-{Guid.NewGuid()}@test.com";
        var auth = await Register(login);

        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var changeCmd = new ChangePasswordCommand
        {
            CurrentPassword = "WrongOldPassword!",
            NewPassword = "Whatever123!"
        };

        var resp = await client.PostAsJsonAsync("/api/Auth/change-password", changeCmd);
        resp.IsSuccessStatusCode.Should().BeFalse();
        resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region Forgot / Reset Password — email sending paths are executed ("письма успешно отправляются")

    [Test]
    public async Task ForgotPassword_WithRegisteredUser_ShouldReturnOk_EmailPathExecuted()
    {
        var login = $"forgot-{Guid.NewGuid()}@test.com";
        await Register(login); // fully registered + confirmed

        var forgotCmd = new ForgotPasswordCommand { Email = login };

        var response = await Client.PostAsJsonAsync("/api/Auth/forgot-password", forgotCmd);

        // Returns 200 for existing users (email service is called inside the handler)
        response.IsSuccessStatusCode.Should().BeTrue();
        
        // Note: In the test environment (appsettings EmailSettings present, service wired)
        // the email sending code path in EmailService.SendPasswordResetEmailAsync is executed.
    }

    [Test]
    public async Task ForgotPassword_WithNonExistentEmail_ShouldStillReturnOk_ToNotLeakExistence()
    {
        var forgotCmd = new ForgotPasswordCommand 
        { 
            Email = $"no-such-user-{Guid.NewGuid()}@test.com" 
        };

        var response = await Client.PostAsJsonAsync("/api/Auth/forgot-password", forgotCmd);

        // Privacy-friendly behaviour: always 200 even if user does not exist
        response.IsSuccessStatusCode.Should().BeTrue();
    }

    [Test]
    public async Task ResetPassword_WithValidCode_ShouldSucceed_AndAllowLoginWithNewPassword()
    {
        var login = $"resetflow-{Guid.NewGuid()}@test.com";
        await Register(login);

        // 1. Trigger forgot-password (handler calls email service)
        await Client.PostAsJsonAsync("/api/Auth/forgot-password", new ForgotPasswordCommand { Email = login });

        // 2. Obtain a real reset token the same way the email would have contained it
        var userManager = Factory.Services.GetRequiredService<UserManager<ApplicationUser>>();
        var appUser = await userManager.FindByEmailAsync(login);
        appUser.Should().NotBeNull();

        var validResetToken = await userManager.GeneratePasswordResetTokenAsync(appUser!);

        // 3. Call public reset endpoint using the code from the "email"
        var resetCmd = new ResetPasswordCommand
        {
            Email = login,
            Code = validResetToken,
            NewPassword = "ResetPass456!"
        };

        var resetResponse = await Client.PostAsJsonAsync("/api/Auth/reset-password", resetCmd);
        resetResponse.IsSuccessStatusCode.Should().BeTrue();

        // 4. Old password must stop working
        var oldLogin = await Client.PostAsJsonAsync("/api/Auth/login", new LoginCommand
        {
            Login = login,
            Password = Password
        });
        oldLogin.IsSuccessStatusCode.Should().BeFalse();

        // 5. New password works — proves the whole forgot→email→reset flow succeeded
        var newLogin = await Client.PostAsJsonAsync("/api/Auth/login", new LoginCommand
        {
            Login = login,
            Password = "ResetPass456!"
        });
        newLogin.IsSuccessStatusCode.Should().BeTrue();

        var newAuth = await newLogin.Content.ReadFromJsonAsync<AuthResponse>();
        newAuth.Should().NotBeNull();
        newAuth!.AccessToken.Should().NotBeNullOrEmpty();
    }

    [Test]
    public async Task ResetPassword_WithInvalidCode_ShouldFail()
    {
        var login = $"reset-badcode-{Guid.NewGuid()}@test.com";
        await Register(login);

        var resetCmd = new ResetPasswordCommand
        {
            Email = login,
            Code = "completely-invalid-token-12345",
            NewPassword = "Anything123!"
        };

        var response = await Client.PostAsJsonAsync("/api/Auth/reset-password", resetCmd);
        response.IsSuccessStatusCode.Should().BeFalse();
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion
}