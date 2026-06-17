using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Application.DTO.Load;
using ApplicationTest.Common;
using FluentAssertions;
using WebApi.Common.Controllers.Abstract;
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
        var loadId = await CreateLoadAndApprove(command);

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
        var loadId = await CreateLoadAndApprove(CreateValidLoadCommand("Public load in list"));

        // Act
        var loads = await GetAllLoads(anonymous: true, status: "Active");

        // Assert
        loads.Should().Contain(l => l.Id == loadId);
    }

    [Test]
    public async Task GetList_ShouldFilterByStartAndEndCity()
    {
        // Arrange
        SetAuth(AuthA);
        var matchedId = await CreateLoadAndApprove(CreateValidLoadCommand("Filtered load", "Yekaterinburg", "Moscow"));
        await CreateLoadAndApprove(CreateValidLoadCommand("Other load", "Kazan", "Novosibirsk"));

        // Act
        var filtered = await GetAllLoadsWithFilter(startCity: "Yekaterinburg", endCity: "Moscow", status: "Active");

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
        var idA = await CreateLoadAndApprove(CreateValidLoadCommand("Load A"));

        SetAuth(AuthB);
        var idB = await CreateLoadAndApprove(CreateValidLoadCommand("Load B"));

        // Act
        SetAuth(AuthA);
        var myLoads = await GetMyLoads("Active");

        // Assert
        myLoads.Should().Contain(l => l.Id == idA);
        myLoads.Should().NotContain(l => l.Id == idB);
    }

    [Test]
    public async Task GetMyLoads_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var anonymousClient = Factory.CreateClient();

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
        
        // Проверяем, что груз действительно создался и доступен по ID (даже если Pending)
        var details = await GetLoadDetails(loadId);
        details.About.Should().Be("Newly Created Load");
    }

    [Test]
    public async Task Create_ShouldReturnBadRequest_WhenPayloadTypeIsInvalid()
    {
        // Arrange
        SetAuth(AuthA);
        var invalidCommand = CreateValidLoadCommand();

        // Некорректное значение Type — валидатор PayloadInputDtoValidator
        // использует .IsEnumName(typeof(PayloadType)) и вернёт ошибку валидации.
        invalidCommand.Payloads[0].Type = "UnknownType123";

        // Act
        var response = await Client.PostAsJsonAsync(LoadBaseUrl, invalidCommand);
        var err = await response.Content.ReadFromJsonAsync<ErrorResponse>();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        err.Should().NotBeNull();

        // Сообщение об ошибке должно содержать упоминание неверного типа груза
        var errorText = (err!.Error ?? "") + " " + (err.Details ?? "");
        errorText.Should().Contain("Payload type");
    }

    [Test]
    public async Task Create_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var anonymousClient = Factory.CreateClient();
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
        var loadId = await CreateLoadAndApprove(CreateValidLoadCommand("Load to be deleted"));

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
        var loadId = await CreateLoadAndApprove(CreateValidLoadCommand("Owner A Load"));

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
        var loadId = await CreateLoadAndApprove(CreateValidLoadCommand("Load with files"));
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
        var loadId = await CreateLoadAndApprove(CreateValidLoadCommand("Protected load"));
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
        var loadId = await CreateLoadAndApprove(CreateValidLoadCommand("Load anonymous upload"));
        var fileBytes = CreateFakeJpegBytes();
        var anonymousClient = Factory.CreateClient();

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
        var loadId = await CreateLoadAndApprove(command);

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

    #region Save / Unsave functionality (previously untested)

    [Test]
    public async Task SaveLoad_ShouldAddToSaved_AndReturnTrue()
    {
        // Arrange
        SetAuth(AuthA);
        var loadId = await CreateLoadAndApprove(CreateValidLoadCommand("Load to save"));

        // Act
        var result = await SaveLoad(loadId);

        // Assert
        result.Should().BeTrue(); // first save returns true (was added)

        var saved = await GetMySavedLoads();
        saved.Should().Contain(l => l.Id == loadId);
    }

    [Test]
    public async Task SaveLoad_Twice_ShouldToggle_AndReturnFalseOnSecond()
    {
        SetAuth(AuthA);
        var loadId = await CreateLoadAndApprove(CreateValidLoadCommand("Toggle save"));

        var first = await SaveLoad(loadId);
        first.Should().BeTrue();

        var second = await SaveLoad(loadId);
        second.Should().BeFalse(); // removed

        var saved = await GetMySavedLoads();
        saved.Should().NotContain(l => l.Id == loadId);
    }

    [Test]
    public async Task GetMySavedLoads_ShouldReturnOnlySavedForCurrentUser()
    {
        SetAuth(AuthA);
        var loadA = await CreateLoadAndApprove(CreateValidLoadCommand("A's load"));
        await SaveLoad(loadA);

        SetAuth(AuthB);
        var loadB = await CreateLoadAndApprove(CreateValidLoadCommand("B's load"));
        await SaveLoad(loadB);

        SetAuth(AuthA);
        var savedA = await GetMySavedLoads();

        savedA.Should().Contain(l => l.Id == loadA);
        savedA.Should().NotContain(l => l.Id == loadB);
    }

    [Test]
    public async Task SaveLoad_NonExistent_ShouldReturnNotFound()
    {
        SetAuth(AuthA);
        var nonExistent = Guid.NewGuid();

        var response = await Client.PostAsync($"{LoadBaseUrl}/{nonExistent}/save", null);
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task SaveLoad_Anonymous_ShouldBeUnauthorized()
    {
        SetAuth(AuthA);
        var loadId = await CreateLoadAndApprove(CreateValidLoadCommand("Anon save test"));

        var anonClient = Factory.CreateClient();
        var response = await anonClient.PostAsync($"{LoadBaseUrl}/{loadId}/save", null);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    #endregion

    #region Stats endpoint (previously untested)

    [Test]
    public async Task Stats_ShouldReturnValidStatsDto()
    {
        SetAuth(AuthA);
        await CreateLoadAndApprove(CreateValidLoadCommand("Stats load 1"));
        await CreateLoadAndApprove(CreateValidLoadCommand("Stats load 2"));

        // New dedicated Stats endpoint
        var response = await Client.GetAsync("/api/Stats");
        response.IsSuccessStatusCode.Should().BeTrue();

        var stats = await response.Content.ReadFromJsonAsync<StatsDto>();
        stats.Should().NotBeNull();
        stats.Uploads.Should().BeGreaterThanOrEqualTo(2);
        stats.Users.Should().BeGreaterThanOrEqualTo(1);
    }

    #endregion


    #region Load list filter coverage (previously very limited)

    [Test]
    public async Task GetList_ShouldFilterBySearchBy()
    {
        SetAuth(AuthA);
        var expectedId = await CreateLoadAndApprove(CreateValidLoadCommand("UniqueSearchTerm123 Cargo"));
        await CreateLoadAndApprove(CreateValidLoadCommand("Other load"));

        var result = await GetAllLoadsWithFullFilter(searchBy: "UniqueSearchTerm123", status: "Active");
        result.Should().Contain(l => l.Id == expectedId);
    }

    [Test]
    public async Task GetList_ShouldSupportDifferentStatuses()
    {
        SetAuth(AuthA);
        var loadId = await CreateLoadAndApprove(CreateValidLoadCommand("Status test"));

        var active = await GetAllLoadsWithFilter(status: "Active");
        active.Should().Contain(l => l.Id == loadId);

        var closed = await GetAllLoadsWithFilter(status: "Closed");
        closed.Should().NotContain(l => l.Id == loadId);
    }

    [Test]
    public async Task GetList_ShouldSupportSortBy()
    {
        SetAuth(AuthA);
        await CreateLoadAndApprove(CreateValidLoadCommandWithPayment("Sort test low", 100));
        await CreateLoadAndApprove(CreateValidLoadCommandWithPayment("Sort test high", 9999));

        var byPaymentDesc = await Client.GetAsync($"{LoadBaseUrl}?sortBy=Payment&isDescending=true");
        byPaymentDesc.IsSuccessStatusCode.Should().BeTrue();
    }

    #endregion

    #region Admin moderation flow (new after admin review feature)

    [Test]
    public async Task PendingLoad_ShouldNotAppearInPublicList()
    {
        SetAuth(AuthA);
        var loadId = await CreateLoad(CreateValidLoadCommand("Pending load"));

        var publicList = await GetAllLoads(anonymous: true, status: "Active");
        publicList.Should().NotContain(l => l.Id == loadId);
    }

    [Test]
    public async Task ApproveFlow_ShouldMakeLoadPublic()
    {
        SetAuth(AuthA);
        var loadId = await CreateLoad(CreateValidLoadCommand("To be approved"));

        // Before approve - not public
        var before = await GetAllLoads(anonymous: true, status: "Active");
        before.Should().NotContain(l => l.Id == loadId);

        // Approve
        await ApproveLoad(loadId);

        // After approve - public
        var after = await GetAllLoads(anonymous: true, status: "Active");
        after.Should().Contain(l => l.Id == loadId);
    }

    [Test]
    public async Task AdminReviews_ShouldContainPendingLoads()
    {
        SetAuth(AuthA);
        var loadId = await CreateLoad(CreateValidLoadCommand("For review"));

        var reviews = await GetAdminReviews();
        reviews.Should().Contain(l => l.Id == loadId);
    }

    [Test]
    public async Task RejectFlow_ShouldMoveLoadToRejected()
    {
        SetAuth(AuthA);
        var loadId = await CreateLoad(CreateValidLoadCommand("To be rejected"));

        await RejectLoad(loadId, "bad cargo");

        var rejected = await GetAllLoadsWithFilter(status: "Rejected"); // or use admin helper if needed
        // We can also check via admin
        SetAuth(AdminTokens);
        var rejectedAdmin = await Client.GetAsync("/api/LoadAdmin/rejected");
        var list = await rejectedAdmin.Content.ReadFromJsonAsync<LoadListVm[]>();
        list.Should().Contain(l => l.Id == loadId);
    }

    [Test]
    public async Task NonAdmin_CannotAccessAdminEndpoints()
    {
        SetAuth(AuthA);
        var loadId = await CreateLoad(CreateValidLoadCommand("Protected"));

        var resp = await Client.GetAsync("/api/LoadAdmin/reviews");
        resp.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var approveResp = await Client.PostAsync($"/api/LoadAdmin/{loadId}/approve", null);
        approveResp.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    #endregion
}
