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
        draft.Payloads.First().Weight.Should().Be(command.Payloads.First().Weight);
        draft.RoutePoints.Should().NotBeEmpty();
        draft.RoutePoints.First().City.Should().Be(command.RoutePoints.First().City);
    }

    [Test]
    public async Task CreateDraft_ShouldReturnUnauthorized_WhenUserIsNotAuthenticated()
    {
        // Arrange
        var command = CreateValidDraftCommand("Unauthorized draft");
        var client = _factory.CreateClient(); // Анонимный клиент

        // Act
        var response = await client.PostAsJsonAsync($"{LoadBaseUrl}/draft", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
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

    #endregion
    
    
}