using System.Net;
using System.Net.Http.Json;
using Application.CQRS.LoadCQ.Commands.Draft.Create;
using Application.DTO.Load;
using ApplicationTest.Common;
using FluentAssertions;

namespace ApplicationTest.IntegrationTests.Load;

public class LoadDraftControllerTests : LoadTestBase
{
    #region POST /api/load/draft (Create)

    [Test]
    public async Task CreateDraft_ShouldReturnGuid_WhenCommandIsValid()
    {
        // Arrange
        SetAuth(AuthA);
        var command = CreateValidDraftCommand("Draft creation test");

        // Act
        var draftId = await CreateDraft(command);

        // Assert
        draftId.Should().NotBeEmpty();
    
        var draft = await GetDraft(draftId);
        draft.About.Should().Be("Draft creation test");
        draft.Payment.Should().Be(command.Payment);
    
        // ПРОВЕРКА Payload и RoutePoints
        draft.Payloads.Should().NotBeEmpty();
        draft.Payloads.First().Weight.Should().Be(command.Payloads?.First().Weight);
        draft.RoutePoints.Should().NotBeEmpty();
        draft.RoutePoints.First().City.Should().Be(command.RoutePoints?.First().City);
    }

    [Test]
    public async Task CreateDraft_ShouldReturnUnauthorized_WhenUserIsNotAuthenticated()
    {
        // Arrange
        var command = CreateValidDraftCommand("Unauthorized draft");
        var client = Factory.CreateClient(); // Анонимный клиент

        // Act
        var response = await client.PostAsJsonAsync($"{LoadBaseUrl}/draft", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task CreateDraft_ShouldAllowEmptyPayloadsAndRoutePoints()
    {
        // Arrange
        SetAuth(AuthA);
        var command = new CreateLoadDraftCommand
        {
            About = "Empty draft",
            Payment = 1000
            // Payloads и RoutePoints не заданы
        };

        // Act
        var draftId = await CreateDraft(command);

        // Assert
        draftId.Should().NotBeEmpty();
        var draft = await GetDraft(draftId);
        draft.About.Should().Be("Empty draft");
        draft.Payloads.Should().BeEmpty();
        draft.RoutePoints.Should().BeEmpty();
    }

    #endregion

    #region GET /api/load/draft/me (Get my drafts)

    [Test]
    public async Task GetMyDrafts_ShouldReturnOnlyCurrentUserDrafts()
    {
        // Arrange
        SetAuth(AuthA);
        var idA = await CreateDraft(CreateValidDraftCommand("Draft A"));

        SetAuth(AuthB);
        var idB = await CreateDraft(CreateValidDraftCommand("Draft B"));

        // Act as User A
        SetAuth(AuthA);
        var response = await Client.GetAsync($"{LoadBaseUrl}/draft/me");
        var draftsA = await response.Content.ReadFromJsonAsync<LoadDraftVm[]>();

        // Assert
        draftsA.Should().NotBeNull();
        draftsA.Should().Contain(d => d.Id == idA);
        draftsA.Should().NotContain(d => d.Id == idB);
    }

    [Test]
    public async Task GetMyDrafts_ShouldReturnUnauthorized_WhenAnonymous()
    {
        var anonymousClient = Factory.CreateClient();

        var response = await anonymousClient.GetAsync($"{LoadBaseUrl}/draft/me");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    #endregion

    #region GET /api/load/draft/{id} (Get draft by id)

    [Test]
    public async Task GetDraftById_ShouldReturnDraft_WhenDraftExistsAndBelongsToUser()
    {
        // Arrange
        SetAuth(AuthA);
        var draftId = await CreateDraft(CreateValidDraftCommand("Specific draft"));

        // Act
        var draft = await GetDraft(draftId);

        // Assert
        draft.Should().NotBeNull();
        draft.Id.Should().Be(draftId);
        draft.About.Should().Be("Specific draft");
    }

    [Test]
    public async Task GetDraftById_ShouldReturnNotFound_WhenDraftBelongsToAnotherUser()
    {
        // Arrange
        SetAuth(AuthA);
        var draftId = await CreateDraft(CreateValidDraftCommand("Private draft"));

        // Act as User B
        SetAuth(AuthB);
        var response = await Client.GetAsync($"{LoadBaseUrl}/draft/{draftId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task GetDraftById_ShouldReturnNotFound_WhenDraftDoesNotExist()
    {
        // Arrange
        SetAuth(AuthA);
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await Client.GetAsync($"{LoadBaseUrl}/draft/{nonExistentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task GetDraftById_ShouldReturnUnauthorized_WhenAnonymous()
    {
        // Arrange
        SetAuth(AuthA);
        var draftId = await CreateDraft(CreateValidDraftCommand("Draft auth"));
        var anonymousClient = Factory.CreateClient();

        // Act
        var response = await anonymousClient.GetAsync($"{LoadBaseUrl}/draft/{draftId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    #endregion

    #region PUT /api/load/draft/{id} (Update)

    [Test]
    public async Task UpdateDraft_ShouldModifyDraft_WhenOwnerUpdates()
    {
        // Arrange
        SetAuth(AuthA);
        var draftId = await CreateDraft(CreateValidDraftCommand("Initial draft"));

        var updateCommand = new UpdateLoadDraftCommand
        {
            Id = draftId,
            About = "Updated draft content",
            Payment = 9999
        };

        // Act
        var response = await Client.PutAsJsonAsync($"{LoadBaseUrl}/draft/{draftId}", updateCommand);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Assert
        var updatedDraft = await GetDraft(draftId);
        updatedDraft.About.Should().Be("Updated draft content");
        updatedDraft.Payment.Should().Be(9999);
    }

    [Test]
    public async Task UpdateDraft_ShouldUpdatePayloadsAndRoutePoints()
    {
        // Arrange
        SetAuth(AuthA);
        var draftId = await CreateDraft(CreateValidDraftCommand("Draft before update"));

        var updateCommand = new UpdateLoadDraftCommand
        {
            Id = draftId,
            About = "Updated with new payload",
            Payment = 7777,
            Payloads = new List<PayloadDraftUpdateDto>
            {
                new()
                {
                    Length = 50,
                    Width = 40,
                    Height = 30,
                    Weight = 100,
                    Amount = 1,
                    Type = "Pallets"
                }
            },
            RoutePoints = new List<RoutePointDraftUpdateDto>
            {
                new ()
                {
                    City = "Kazan",
                    Address = "Updated address",
                    ArrivalTime = DateTime.UtcNow.AddDays(7)
                }
            }
        };

        // Act
        var response = await Client.PutAsJsonAsync($"{LoadBaseUrl}/draft/{draftId}", updateCommand);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Assert
        var updatedDraft = await GetDraft(draftId);
        updatedDraft.About.Should().Be("Updated with new payload");
        updatedDraft.Payment.Should().Be(7777);
        updatedDraft.Payloads.Should().ContainSingle();
        updatedDraft.Payloads.First().Weight.Should().Be(100);
        updatedDraft.Payloads.First().Type.Should().Be("Pallets");
        updatedDraft.RoutePoints.Should().ContainSingle();
        updatedDraft.RoutePoints.First().City.Should().Be("Kazan");
    }

    [Test]
    public async Task UpdateDraft_ShouldReturnForbidden_WhenNonOwnerAttemptsUpdate()
    {
        // Arrange
        SetAuth(AuthA);
        var draftId = await CreateDraft(CreateValidDraftCommand("Owner A draft"));

        var updateCommand = new UpdateLoadDraftCommand
        {
            Id = draftId,
            About = "Malicious update"
        };

        // Act as User B
        SetAuth(AuthB);
        var response = await Client.PutAsJsonAsync($"{LoadBaseUrl}/draft/{draftId}", updateCommand);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Test]
    public async Task UpdateDraft_ShouldReturnNotFound_WhenDraftDoesNotExist()
    {
        // Arrange
        SetAuth(AuthA);
        var nonExistentId = Guid.NewGuid();
        var updateCommand = new UpdateLoadDraftCommand
        {
            Id = nonExistentId,
            About = "Ghost update"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"{LoadBaseUrl}/draft/{nonExistentId}", updateCommand);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion

    #region DELETE /api/load/draft/{id} (Delete)

    [Test]
    public async Task DeleteDraft_ShouldRemoveDraft_WhenOwnerDeletes()
    {
        // Arrange
        SetAuth(AuthA);
        var draftId = await CreateDraft(CreateValidDraftCommand("To be deleted"));

        // Act
        var response = await DeleteDraft(draftId);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Проверяем, что черновик удален
        var getResponse = await Client.GetAsync($"{LoadBaseUrl}/draft/{draftId}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task DeleteDraft_ShouldReturnForbidden_WhenNonOwnerAttemptsDelete()
    {
        // Arrange
        SetAuth(AuthA);
        var draftId = await CreateDraft(CreateValidDraftCommand("Protected draft"));

        // Act as User B
        SetAuth(AuthB);
        var response = await DeleteDraft(draftId);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Test]
    public async Task DeleteDraft_ShouldReturnNotFound_WhenDraftDoesNotExist()
    {
        // Arrange
        SetAuth(AuthA);
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await DeleteDraft(nonExistentId);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion

    #region Unit conversion (timezone + metric/imperial)

    [Test]
    public async Task CreateDraft_AndGetDraft_ShouldRespectUserSettings()
    {
        // Arrange
        SetAuth(AuthA);
        await GetCurrentUserSettings();
        var command = CreateValidDraftCommand("Draft conversion");
        command.RoutePoints?[0].ArrivalTime = new DateTime(2026, 6, 15, 12, 0, 0, DateTimeKind.Utc);

        // Act
        var draftId = await CreateDraft(command);
        var draft = await GetDraft(draftId);

        // Assert: время всегда приводится к таймзоне и обратно
        if (command.RoutePoints != null)
            draft.RoutePoints[0].ArrivalTime.Should()
                .BeCloseTo(command.RoutePoints[0].ArrivalTime, TimeSpan.FromSeconds(1));

        // Для черновика нет анонимного доступа, поэтому проверяем только round-trip стабильность
        draft.Payloads[0].Height.Should().BeApproximately(command.Payloads?[0].Height, 0.01);
        draft.Payloads[0].Width.Should().BeApproximately(command.Payloads?[0].Width, 0.01);
        draft.Payloads[0].Length.Should().BeApproximately(command.Payloads?[0].Length, 0.01);
        draft.Payloads[0].Weight.Should().BeApproximately(command.Payloads?[0].Weight, 0.01);
    }

    #endregion
    
    
}