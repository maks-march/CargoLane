using System.Net;
using System.Net.Http.Json;
using ApplicationTest.Common;
using FluentAssertions;
using WebApi.DTO;

namespace ApplicationTest.IntegrationTests.Load;

public class LoadControllerTests : LoadTestBase
{
    #region Get by Id (GetDetails)

    [Test]
    public async Task GetById_ShouldReturnLoadDetails_WhenLoadExists()
    {
        // Arrange: Создаем груз от имени пользователя A
        SetAuth(AuthA);
        var command = CreateValidLoadCommand("Test Load for GetById");
        var loadId = await CreateLoad(command);

        // Act: Получаем детали груза (можно анонимно, так как [AllowAnonymous])
        var result = await GetLoadDetails(loadId, anonymous: true);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(loadId);
        result.About.Should().Be("Test Load for GetById");
        result.Payment.Should().Be(command.Payment);
    }

    [Test]
    public async Task GetById_ShouldReturnNotFound_WhenLoadDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await Client.GetAsync($"{LoadBaseUrl}/{nonExistentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion

    #region Create

    [Test]
    public async Task Create_ShouldReturnGuid_AndPersistLoad()
    {
        // Arrange
        SetAuth(AuthA);
        var command = CreateValidLoadCommand("Newly Created Load");

        // Act
        var loadId = await CreateLoad(command);

        // Assert
        loadId.Should().NotBeEmpty();
        
        // Проверяем, что груз действительно создался и доступен
        var details = await GetLoadDetails(loadId);
        details.About.Should().Be("Newly Created Load");
    }

    [Test]
    public async Task Create_ShouldReturnBadRequest_WhenPayloadTypeIsInvalid()
    {
        // Arrange
        SetAuth(AuthA);
        var invalidCommand = CreateValidLoadCommand();
        // В CreateLoadCommand.cs используется Enum.Parse для типа груза. 
        // Некорректное значение должно привести к ошибке.
        invalidCommand.Payloads[0].Type = "UnknownType123"; 

        // Act
        var response = await Client.PostAsJsonAsync(LoadBaseUrl, invalidCommand);
        var err = response.Content.ReadFromJsonAsync(typeof(ErrorResponse)).Result;
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region Delete

    [Test]
    public async Task Delete_ShouldReturnNoContent_WhenOwnerDeletesLoad()
    {
        // Arrange
        SetAuth(AuthA);
        var loadId = await CreateLoad(CreateValidLoadCommand("Load to be deleted"));

        // Act
        var response = await DeleteLoad(loadId);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Проверяем, что груз больше не находится
        var getResponse = await Client.GetAsync($"{LoadBaseUrl}/{loadId}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task Delete_ShouldReturnForbidden_WhenNonOwnerAttemptsDelete()
    {
        // Arrange: Пользователь A создает груз
        SetAuth(AuthA);
        var loadId = await CreateLoad(CreateValidLoadCommand("Owner A Load"));

        // Act: Пользователь B пытается его удалить
        SetAuth(AuthB);
        var response = await DeleteLoad(loadId);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Test]
    public async Task Delete_ShouldReturnNotFound_WhenLoadDoesNotExist()
    {
        // Arrange
        SetAuth(AuthA);
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await DeleteLoad(nonExistentId);

        // Assert
        // Примечание: В зависимости от реализации Handler-а, 
        // если груз не найден, обычно выбрасывается NotFoundException
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion
}