using System.Net;
using System.Net.Http.Headers;
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

    #region Get list (GetList)

    [Test]
    public async Task GetList_ShouldReturnActiveLoads_Anonymously()
    {
        // Arrange
        SetAuth(AuthA);
        var loadId = await CreateLoad(CreateValidLoadCommand("Public load in list"));

        // Act
        var loads = await GetAllLoads(anonymous: true);

        // Assert
        loads.Should().Contain(l => l.Id == loadId);
    }

    [Test]
    public async Task GetList_ShouldFilterByStartAndEndCity()
    {
        // Arrange
        SetAuth(AuthA);
        var matchedId = await CreateLoad(CreateValidLoadCommand("Filtered load", "Yekaterinburg", "Moscow"));
        await CreateLoad(CreateValidLoadCommand("Other load", "Kazan", "Novosibirsk"));

        // Act
        var filtered = await GetAllLoadsWithFilter(startCity: "Yekaterinburg", endCity: "Moscow");

        // Assert
        filtered.Should().Contain(l => l.Id == matchedId);
    }

    #endregion

    #region Get my loads (GetMy)

    [Test]
    public async Task GetMyLoads_ShouldReturnOnlyCurrentUserLoads()
    {
        // Arrange
        SetAuth(AuthA);
        var idA = await CreateLoad(CreateValidLoadCommand("Load A"));

        SetAuth(AuthB);
        var idB = await CreateLoad(CreateValidLoadCommand("Load B"));

        // Act
        SetAuth(AuthA);
        var myLoads = await GetMyLoads();

        // Assert
        myLoads.Should().Contain(l => l.Id == idA);
        myLoads.Should().NotContain(l => l.Id == idB);
    }

    [Test]
    public async Task GetMyLoads_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var anonymousClient = _factory.CreateClient();

        var response = await anonymousClient.GetAsync($"{LoadBaseUrl}/me");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
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
        var err = await response.Content.ReadFromJsonAsync<ErrorResponse>();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        err.Should().NotBeNull();
    }

    [Test]
    public async Task Create_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var anonymousClient = _factory.CreateClient();
        var command = CreateValidLoadCommand("Anonymous load");

        var response = await anonymousClient.PostAsJsonAsync(LoadBaseUrl, command);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
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

    #region Upload files

    [Test]
    public async Task UploadFiles_ShouldAttachFiles_WhenOwnerUploads()
    {
        // Arrange
        SetAuth(AuthA);
        var loadId = await CreateLoad(CreateValidLoadCommand("Load with files"));
        var fileBytes = CreateFakeJpegBytes();

        // Act
        var response = await UploadLoadFiles(loadId, fileBytes, "cargo-doc.jpg");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var filePaths = await GetLoadFilePaths(loadId, anonymous: true);
        filePaths.Should().NotBeEmpty();
        filePaths.Should().Contain(p => p.Contains("cargo-doc") || p.EndsWith(".jpg"));
    }

    [Test]
    public async Task UploadFiles_ShouldReturnForbidden_WhenNonOwnerUploads()
    {
        // Arrange
        SetAuth(AuthA);
        var loadId = await CreateLoad(CreateValidLoadCommand("Protected load"));
        var fileBytes = CreateFakeJpegBytes();

        // Act
        SetAuth(AuthB);
        var response = await UploadLoadFiles(loadId, fileBytes, "hack.jpg");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Test]
    public async Task UploadFiles_ShouldReturnUnauthorized_WhenAnonymous()
    {
        // Arrange
        SetAuth(AuthA);
        var loadId = await CreateLoad(CreateValidLoadCommand("Load anonymous upload"));
        var fileBytes = CreateFakeJpegBytes();
        var anonymousClient = _factory.CreateClient();

        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(fileBytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "files", "anonymous.jpg");

        // Act
        var response = await anonymousClient.PutAsync($"{LoadBaseUrl}/{loadId}/files", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    #endregion

    #region Unit conversion (timezone + metric/imperial)

    [Test]
    public async Task GetDetails_ShouldApplyUserSettingsConversion_VersusAnonymousRawValues()
    {
        // Arrange
        SetAuth(AuthA);
        var (timezone, isMetric) = await GetCurrentUserSettings();

        var command = CreateValidLoadCommand("Conversion test");
        command.RoutePoints[0].ArrivalTime = DateTime.UtcNow.AddDays(1);
        var loadId = await CreateLoad(command);

        // Act: авторизованный пользователь получает данные в своих единицах
        var userDetails = await GetLoadDetails(loadId);

        // Act: анонимный пользователь получает сырые метрические значения
        var rawDetails = await GetLoadDetails(loadId, anonymous: true);

        // Assert: время всегда приводится к таймзоне пользователя и обратно
        userDetails.RoutePoints[0].ArrivalTime.Should().BeCloseTo(command.RoutePoints[0].ArrivalTime, TimeSpan.FromSeconds(1));

        if (!isMetric)
        {
            // Для имперской системы: на создании значения * 1.609 (длины) и * 0.4536 (вес),
            // на чтении: / 1.609 и * 2.20462. Сравниваем "пользовательские" с "сырыми".
            userDetails.Payloads[0].Height.Should().BeApproximately(rawDetails.Payloads[0].Height / 1.609, 0.01);
            userDetails.Payloads[0].Width.Should().BeApproximately(rawDetails.Payloads[0].Width / 1.609, 0.01);
            userDetails.Payloads[0].Length.Should().BeApproximately(rawDetails.Payloads[0].Length / 1.609, 0.01);
            userDetails.Payloads[0].Weight.Should().BeApproximately(rawDetails.Payloads[0].Weight / 0.4536, 0.01);
        }
        else
        {
            // Метрическая система: преобразования размеров не производятся
            userDetails.Payloads[0].Height.Should().BeApproximately(rawDetails.Payloads[0].Height, 0.01);
            userDetails.Payloads[0].Width.Should().BeApproximately(rawDetails.Payloads[0].Width, 0.01);
            userDetails.Payloads[0].Length.Should().BeApproximately(rawDetails.Payloads[0].Length, 0.01);
            userDetails.Payloads[0].Weight.Should().BeApproximately(rawDetails.Payloads[0].Weight, 0.01);
        }
    }

    #endregion
}
