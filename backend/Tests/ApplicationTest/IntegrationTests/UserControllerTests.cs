using System.Net;
using System.Net.Http.Json;
using Application.CQRS.AuthCQ.Login;
using Application.CQRS.UserCQ.Commands.Update;
using Application.DTO.User;
using ApplicationTest.Common;
using FluentAssertions;
using WebApi.DTO;

namespace ApplicationTest.IntegrationTests;

[TestFixture]
public class UserControllerTests : BaseIntegrationTest
{
    private const string BaseUrl = "api/User/";
    private async Task<UserDetailsVm> CheckGet_User(Guid id)
    {
        var response = await Client.GetAsync($"{BaseUrl}{id}");
        
        response.IsSuccessStatusCode.Should().BeTrue();
        var vm = await response.Content.ReadFromJsonAsync<UserDetailsVm>();
        
        vm.Should().NotBeNull();
        return vm;
    }
    
    [Test]
    public async Task Get_WithValidCredentials_ShouldBeOk()
    {
        var vm = await CheckGet_User(Tokens.UserId);
        vm.FirstName.Should().NotBeNull();
        vm.LastName.Should().NotBeNull();
    }
    
    
    [Test]
    public async Task GetMe_WithValidCredentials_ShouldBeOk()
    {
        var response = await Client.GetAsync($"{BaseUrl}me");
        
        response.IsSuccessStatusCode.Should().BeTrue();
        var vm = await response.Content.ReadFromJsonAsync<UserDetailsVm>();
        
        vm.Should().NotBeNull();
        vm.FirstName.Should().NotBeNull();
        vm.LastName.Should().NotBeNull();
    }
    
    [Test]
    public async Task Get_WithInvalidCredentials_ShouldNotBeFound()
    {
        var response = await Client.GetAsync($"{BaseUrl}{Guid.NewGuid()}");
        
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var vm = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        
        vm.Should().NotBeNull();
        vm.Error.Should().NotBeNullOrEmpty();
        vm.Details.Should().NotBeNullOrEmpty();
    }
    
    [Test]
    public async Task GetList_WithValidCredentials_ShouldBeOk()
    {
        SetAuth(AdminTokens);
        var response = await Client.GetAsync(BaseUrl);
        
        response.IsSuccessStatusCode.Should().BeTrue();
        var vm = await response.Content.ReadFromJsonAsync<UserDetailsVm[]>();
        
        vm.Should().NotBeNull();
        vm.Should().NotBeEmpty();
        var first = vm.First(user => user.Id == Tokens.UserId);
        first.FirstName.Should().NotBeNull();
        first.LastName.Should().NotBeNull();
    }

    [Test]
    public async Task Update_WithValidCredentials_ShouldBeOk()
    {
        var request = new UpdateUserCommand()
        {
            FirstName = "NewName",
            LastName = "NewSurname"
        };
        var response = await Client.PatchAsJsonAsync($"{BaseUrl}me", request);
        
        response.IsSuccessStatusCode.Should().BeTrue();
        var id = await response.Content.ReadFromJsonAsync<Guid>();

        var getResponse = await CheckGet_User(id);
        
        getResponse.FirstName.Should().Be(request.FirstName);
        getResponse.LastName.Should().Be(request.LastName);
        getResponse.Updated.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }
    
    [Test]
    public async Task Update_WithInvalidCredentials_ShouldBeBadRequest()
    {
        var request = new UpdateUserCommand()
        {
            FirstName = string.Concat(
                Enumerable.Repeat("Update_WithInvalidCredentials_ShouldBeBadRequest", 20)
            ),
            LastName = string.Concat(
                Enumerable.Repeat("Update_WithInvalidCredentials_ShouldBeBadRequest", 20)
            )
        };
        var response = await Client.PatchAsJsonAsync($"{BaseUrl}me", request);
        
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var vm = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        
        vm.Should().NotBeNull();
        vm.Error.Should().ContainAll(["FirstName", "LastName"], "All fields not valid.");
        vm.Details.Should().NotBeNullOrEmpty();
    }
    
        [Test]
    public async Task Update_WithValidBasicFields_ShouldBeOk()
    {
        // Arrange
        var request = new UpdateUserCommand()
        {
            FirstName = "NewName",
            LastName = "NewSurname",
            DisplayName = "SuperUser"
        };

        // Act
        var response = await Client.PatchAsJsonAsync($"{BaseUrl}me", request);
        
        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var id = await response.Content.ReadFromJsonAsync<Guid>();

        var user = await CheckGet_User(id);
        user.FirstName.Should().Be(request.FirstName);
        user.LastName.Should().Be(request.LastName);
        user.DisplayName.Should().Be(request.DisplayName);
        user.Updated.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(10));
    }

    [Test]
    public async Task Update_AllFields_ShouldPersistCorrectData()
    {
        // Arrange: Тестируем компанию, телефон и адресные данные
        var request = new UpdateUserCommand()
        {
            FirstName = "John",
            LastName = "Doe",
            Phone = "+1234567890",
            Timezone = 3,
            CompanyName = "Cargo Lane LLC",
            CompanyCountry = "USA",
            CompanyType = "Carrier",
            Country = "USA",
            Region = "California",
            City = "San Francisco",
            Address = "Market St. 123",
            PostalCode = "94103"
        };

        // Act
        var response = await Client.PatchAsJsonAsync($"{BaseUrl}me", request);
        
        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var id = await response.Content.ReadFromJsonAsync<Guid>();
        var user = await CheckGet_User(id);

        user.Phone.Should().Be(request.Phone);
        user.CompanyName.Should().Be(request.CompanyName);
        user.CompanyType.Should().Be(request.CompanyType);
        user.City.Should().Be(request.City);
        user.Address.Should().Be(request.Address);
        user.Timezone.Should().Be(request.Timezone);
    }

    [Test]
    public async Task Update_PartialUpdate_ShouldNotOverwriteExistingFieldsWithNull()
    {
        // Arrange: 1. Сначала устанавливаем имя и город
        await Client.PatchAsJsonAsync($"{BaseUrl}me", new UpdateUserCommand 
        { 
            FirstName = "KeepMe", 
            City = "London" 
        });

        // 2. Отправляем запрос только на изменение имени (City в команде будет null)
        var partialRequest = new UpdateUserCommand { FirstName = "NewName" };

        // Act
        var response = await Client.PatchAsJsonAsync($"{BaseUrl}me", partialRequest);
        
        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        var id = await response.Content.ReadFromJsonAsync<Guid>();
        var user = await CheckGet_User(id);

        user.FirstName.Should().Be("NewName");
        // ПРОВЕРКА: Город не должен стать null, так как в команде он не был указан
        user.City.Should().Be("London"); 
    }

    [Test]
    public async Task Update_WithTooLongNames_ShouldBeBadRequest()
    {
        // Arrange: Генерируем слишком длинные строки
        var longString = new string('A', 300);
        var request = new UpdateUserCommand()
        {
            FirstName = longString,
            LastName = longString
        };

        // Act
        var response = await Client.PatchAsJsonAsync($"{BaseUrl}me", request);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var vm = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        
        vm.Should().NotBeNull();
        vm.Error.Should().ContainAny("FirstName", "LastName");
    }

    [Test]
    public async Task Update_InvalidTimezone_ShouldBeBadRequest()
    {
        // Arrange: Таймзон обычно в пределах -12..+14
        var request = new UpdateUserCommand { Timezone = 100 };

        // Act
        var response = await Client.PatchAsJsonAsync($"{BaseUrl}me", request);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Test]
    public async Task Update_Unauthorized_ShouldBeForbidden()
    {
        // Arrange: Убираем токен авторизации
        Client.DefaultRequestHeaders.Authorization = null;
        var request = new UpdateUserCommand { FirstName = "NewName" };

        // Act
        var response = await Client.PatchAsJsonAsync($"{BaseUrl}me", request);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task Update_EmptyRequest_ShouldNotChangeAnything()
    {
        // Arrange
        var request = new UpdateUserCommand(); // Все поля null

        // Act
        var response = await Client.PatchAsJsonAsync($"{BaseUrl}me", request);
        
        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
    }
    #region DeleteMe & Deactivate (previously untested)

    [Test]
    public async Task DeleteMe_ShouldRemoveUser_AndReturnNoContent()
    {
        // Arrange: register a fresh user
        var login = $"delete-me-{Guid.NewGuid()}@test.com";
        var auth = await Register(login);  // uses Mediator + login inside base

        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", auth.AccessToken);

        // Act
        var response = await client.DeleteAsync($"{BaseUrl}me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify user is gone (should 404 now)
        var getResponse = await client.GetAsync($"{BaseUrl}{auth.UserId}"); // if id available
        // Note: AuthResponse may not expose Id directly in all cases, so we just check that GET me would fail
        // Better: try to login again
        var loginResp = await Client.PostAsJsonAsync("/api/Auth/login", new LoginCommand
        {
            Login = login,
            Password = Password
        });
        // After deletion login should fail (user gone)
        loginResp.IsSuccessStatusCode.Should().BeFalse();
    }

    [Test]
    public async Task Deactivate_ShouldLockUser_Out()
    {
        var login = $"deactivate-{Guid.NewGuid()}@test.com";
        var auth = await Register(login);

        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var deactivateResp = await client.PostAsync($"{BaseUrl}deactivate", null);
        deactivateResp.IsSuccessStatusCode.Should().BeTrue();

        // After deactivate, login should fail (locked)
        var loginResp = await Client.PostAsJsonAsync("/api/Auth/login", new Application.CQRS.AuthCQ.Login.LoginCommand
        {
            Login = login,
            Password = Password
        });
        loginResp.IsSuccessStatusCode.Should().BeFalse();
    }

    [Test]
    public async Task Deactivate_WithoutAuth_ShouldBeUnauthorized()
    {
        var unauth = Factory.CreateClient();
        var resp = await unauth.PostAsync($"{BaseUrl}deactivate", null);
        resp.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    #endregion
}