using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;

namespace ApplicationTest.IntegrationTests.Truck;

public class TruckWriteTests : TruckTestBase
{
    [Test]
    public async Task Post_ValidCommand_ReturnsGuid()
    {
        var command = GetTestCreateCommand();
        var response = await Client.PostAsJsonAsync(BaseUrl, command);
        
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var id = await response.Content.ReadFromJsonAsync<Guid>();
        id.Should().NotBeEmpty();
    }

    [Test]
    public async Task Post_InvalidData_ReturnsBadRequest()
    {
        var command = GetTestCreateCommand(bodyType: "");
        var response = await Client.PostAsJsonAsync(BaseUrl, command);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Test]
    public async Task Delete_OwnTruck_ReturnsNoContent()
    {
        var truckId = await CreateTestTruck();
        var response = await Client.DeleteAsync($"{BaseUrl}/{truckId}");

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Test]
    public async Task Delete_ForeignTruck_ReturnsForbidden()
    {
        var truckId = await CreateTestTruck(); // Создал первый юзер

        // Переключаемся на другого юзера
        var secondUser = await Register("OtherUser@mail.ru");
        
        secondUser.Should().NotBeNull();
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", secondUser.AccessToken);

        var response = await Client.DeleteAsync($"{BaseUrl}/{truckId}");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // Возвращаем авторизацию назад
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", Tokens.AccessToken);
    }
}