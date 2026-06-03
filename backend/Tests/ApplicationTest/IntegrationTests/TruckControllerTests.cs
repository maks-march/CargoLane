

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Application.CQRS.TruckCQ.Commands.Create;
using Application.CQRS.TruckCQ.Commands.Update;
using Application.DTO.Truck;
using ApplicationTest.Common;
using FluentAssertions;
using WebApi.DTO;

namespace ApplicationTest.IntegrationTests;

public class TruckControllerTests : BaseIntegrationTest
{
    private const string BaseUrl = "/api/Truck";

    [Test]
    public async Task Create_Truck_Returns_Guid_And_Succeeds()
    {
        // Arrange
        var command = GetTestCreateCommand();

        // Act
        var response = await Client.PostAsJsonAsync(BaseUrl, command);
        var truckId = await ExtractFromResponse<Guid>(response);

        // Assert
        truckId.Should().NotBeEmpty();
    }

    [Test]
    public async Task Get_By_Id_Returns_TruckDetails_When_Exists()
    {
        // Arrange
        var truckId = await CreateTestTruck();

        // Act
        var response = await Client.GetAsync($"{BaseUrl}/{truckId}");
        var result = await ExtractFromResponse<TruckDetailsVm>(response);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(truckId);
        result.BodyType.Should().Be("Тент");
    }

    [Test]
    public async Task Get_By_Id_Returns_NotFound_When_Not_Exists()
    {
        // Arrange
        var fakeId = Guid.NewGuid();

        // Act
        var response = await Client.GetAsync($"{BaseUrl}/{fakeId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        error.Should().NotBeNull();
    }

    [Test]
    public async Task Get_List_Returns_Array_With_Filters()
    {
        // Arrange
        await CreateTestTruck(); // Создаем хотя бы один

        // Act
        var response = await Client.GetAsync($"{BaseUrl}?BodyType=Тент&IsAscending=true");
        var result = await ExtractFromResponse<TruckListVm[]>(response);

        // Assert
        result.Should().NotBeNull();
        result!.Length.Should().BeGreaterThanOrEqualTo(1);
    }

    [Test]
    public async Task Update_Truck_Returns_Ok_And_Changes_Data()
    {
        // Arrange
        var truckId = await CreateTestTruck();
        var updateCommand = new UpdateTruckCommand 
        { 
            Id = truckId, 
            BodyType = "Рефрижератор",
            Vehicles = 5
        };

        // Act
        var response = await Client.PatchAsJsonAsync($"{BaseUrl}/{truckId}", updateCommand);
        
        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        // Проверяем изменения
        var getResponse = await Client.GetAsync($"{BaseUrl}/{truckId}");
        var updatedTruck = await ExtractFromResponse<TruckDetailsVm>(getResponse);
        updatedTruck!.BodyType.Should().Be("Рефрижератор");
        updatedTruck.Vehicles.Should().Be(5);
    }

    [Test]
    public async Task Delete_Truck_Returns_NoContent_And_Removes_Entity()
    {
        // Arrange
        var truckId = await CreateTestTruck();

        // Act
        var deleteResponse = await Client.DeleteAsync($"{BaseUrl}/{truckId}");

        // Assert
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Проверяем, что больше не существует
        var getResponse = await Client.GetAsync($"{BaseUrl}/{truckId}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task Update_By_Another_User_Returns_Forbidden_Or_Unauthorized()
    {
        // Arrange
        var truckId = await CreateTestTruck(); // Создан основным юзером из BaseIntegrationTest

        // Регистрируем и логинимся под вторым юзером
        var secondUserTokens = await Register("SecondUser");
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", secondUserTokens!.AccessToken);

        var updateCommand = new UpdateTruckCommand { Id = truckId, BodyType = "HackerType" };

        // Act
        var response = await Client.PatchAsJsonAsync($"{BaseUrl}/{truckId}", updateCommand);

        // Assert
        // Если в хендлере прописана проверка на автора и кидается ForbiddenException
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        
        // Возвращаем токен первого юзера для остальных тестов
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", Tokens.AccessToken);
    }

    [Test]
    public async Task Post_Without_Token_Returns_Unauthorized()
    {
        // Arrange
        Client.DefaultRequestHeaders.Authorization = null;
        var command = GetTestCreateCommand();

        // Act
        var response = await Client.PostAsJsonAsync(BaseUrl, command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        
        // Возвращаем токен назад
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", Tokens.AccessToken);
    }

    #region Helpers

    private CreateTruckCommand GetTestCreateCommand() => new()
    {
        BodyType = "Тент",
        LoadType = new List<string> { "Задняя" },
        UnloadType = new List<string> { "Задняя" },
        Vehicles = 1,
        ByCash = 1000,
        TaxedByCard = 1200,
        NotTaxedByCard = 1100
    };

    private async Task<Guid> CreateTestTruck()
    {
        var response = await Client.PostAsJsonAsync(BaseUrl, GetTestCreateCommand());
        return await ExtractFromResponse<Guid>(response);
    }

    #endregion
}