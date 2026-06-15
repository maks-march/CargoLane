using System.Net;
using System.Net.Http.Json;
using Application.CQRS.LoadCQ.Commands;
using Application.CQRS.LoadCQ.Commands.CreateLoad;
using Application.DTO.Load;
using ApplicationTest.Common;
using FluentAssertions;

namespace ApplicationTest.IntegrationTests.Load;

public class LoadControllerTests : LoadTestBase
{
    #region GET /api/Load (public list + filters) — 2 tests

    [Test]
    public async Task GetAllLoads_Public_ShouldReturnList_Anonymous()
    {
        // Arrange: AuthA creates a load
        SetAuth(AuthA);
        var cmd = CreateValidLoadCommand("Public load for anonymous test", "Yekaterinburg", "Moscow");
        var loadId = await CreateLoad(cmd);

        // Act: anonymous call (no auth)
        var loads = await GetAllLoads(anonymous: true);

        // Assert
        loads.Should().NotBeNull();
        loads.Should().Contain(l => l.Id == loadId);
        loads.First(l => l.Id == loadId).StartCity.Should().Be("Yekaterinburg");
        loads.First(l => l.Id == loadId).EndCity.Should().Be("Moscow");
    }

    [Test]
    public async Task GetAllLoads_WithFilters_ShouldReturnFilteredResults()
    {
        SetAuth(AuthA);
        var cmd1 = CreateValidLoadCommand("Filter test 1", "Yekaterinburg", "Moscow");
        var id1 = await CreateLoad(cmd1);

        var cmd2 = CreateValidLoadCommand("Filter test 2", "Novosibirsk", "Saint Petersburg");
        var id2 = await CreateLoad(cmd2);

        // Act: filter by start city
        var filteredStart = await GetAllLoadsWithFilter(startCity: "Yekaterinburg");
        filteredStart.Should().Contain(l => l.Id == id1);
        filteredStart.Should().NotContain(l => l.Id == id2);

        // Act: filter by end city
        var filteredEnd = await GetAllLoadsWithFilter(endCity: "Moscow");
        filteredEnd.Should().Contain(l => l.Id == id1);
        filteredEnd.Should().NotContain(l => l.Id == id2);

        // Act: filter by status (Live)
        var filteredStatus = await GetAllLoadsWithFilter(status: "Live");
        filteredStatus.Should().Contain(l => l.Id == id1 || l.Id == id2);
    }

    #endregion

    #region GET /api/Load/user — 2 tests

    [Test]
    public async Task GetUserLoads_ShouldReturnOnlyCurrentUserLoads()
    {
        // Arrange: AuthA creates 2 loads, AuthB creates 1
        SetAuth(AuthA);
        var loadA1 = await CreateLoad(CreateValidLoadCommand("UserA load 1"));
        var loadA2 = await CreateLoad(CreateValidLoadCommand("UserA load 2"));

        SetAuth(AuthB);
        var loadB = await CreateLoad(CreateValidLoadCommand("UserB load"));

        // Act as AuthA
        SetAuth(AuthA);
        var userLoadsA = await GetUserLoads();

        // Assert
        userLoadsA.Should().HaveCount(2);
        userLoadsA.Should().Contain(l => l.Id == loadA1);
        userLoadsA.Should().Contain(l => l.Id == loadA2);
        userLoadsA.Should().NotContain(l => l.Id == loadB);

        // Act as AuthB
        SetAuth(AuthB);
        var userLoadsB = await GetUserLoads();
        userLoadsB.Should().ContainSingle(l => l.Id == loadB);
    }

    [Test]
    public async Task GetUserLoads_And_GetMy_ShouldReturnSameResults_ForLegacyCompatibility()
    {
        SetAuth(AuthA);
        var loadId = await CreateLoad(CreateValidLoadCommand("Compatibility test load"));

        var viaUser = await GetUserLoads();
        var viaMe = await GetMyLoads();

        viaUser.Should().BeEquivalentTo(viaMe);
        viaUser.Should().Contain(l => l.Id == loadId);
    }

    #endregion

    #region GET /api/Load/{id} (public details) — 2 tests

    [Test]
    public async Task GetLoadDetails_Public_ShouldReturnFullDetails_Anonymous()
    {
        SetAuth(AuthA);
        var cmd = CreateValidLoadCommand("Public details test");
        var loadId = await CreateLoad(cmd);

        // Act: anonymous
        var details = await GetLoadDetails(loadId, anonymous: true);

        details.Should().NotBeNull();
        details.Id.Should().Be(loadId);
        details.Payment.Should().Be(5500);
        details.Payloads.Should().HaveCount(1);
        details.RoutePoints.Should().HaveCount(2);
        details.Status.Should().Be("Live");
        details.Photos.Should().BeEmpty(); // no photos in this test
    }

    [Test]
    public async Task GetLoadDetails_ShouldReturn404_ForNonExistentLoad()
    {
        var fakeId = Guid.NewGuid();

        var response = await Client.GetAsync($"{LoadBaseUrl}/{fakeId}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion

    #region GET /api/Load/draft/{id} — 2 tests

    [Test]
    public async Task GetDraft_ShouldReturnDraft_ForOwner()
    {
        SetAuth(AuthA);
        var draftCmd = CreateValidDraftCommand("My draft");
        var draftId = await CreateDraft(draftCmd);

        var draft = await GetDraft(draftId);

        draft.Should().NotBeNull();
        draft.Id.Should().Be(draftId);
        draft.About.Should().Be("My draft");
        draft.Payment.Should().Be(3200);
    }

    [Test]
    public async Task GetDraft_ShouldReturn404_WhenDraftBelongsToAnotherUser()
    {
        SetAuth(AuthA);
        var draftId = await CreateDraft(CreateValidDraftCommand("A's draft"));

        // Switch to another user
        SetAuth(AuthB);
        var response = await Client.GetAsync($"{LoadBaseUrl}/draft/{draftId}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion

    #region POST /api/Load (create full load) — 2 tests

    [Test]
    public async Task CreateLoad_ShouldReturnId_AndLoadAppearsInList()
    {
        SetAuth(AuthA);
        var cmd = CreateValidLoadCommand("New full load");

        var loadId = await CreateLoad(cmd);

        loadId.Should().NotBeEmpty();

        // Verify it appears in public list
        var allLoads = await GetAllLoads(anonymous: true);
        allLoads.Should().Contain(l => l.Id == loadId);

        // Verify in my list
        var myLoads = await GetUserLoads();
        myLoads.Should().Contain(l => l.Id == loadId);
    }

    [Test]
    public async Task CreateLoad_WithInvalidPayload_ShouldReturnBadRequest()
    {
        SetAuth(AuthA);
        var badCmd = CreateValidLoadCommand();
        badCmd.Payloads[0].Type = "InvalidType"; // not in PayloadType enum

        var response = await Client.PostAsJsonAsync(LoadBaseUrl, badCmd);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/Load/draft — 2 tests

    [Test]
    public async Task CreateDraft_ShouldReturnId_AndBeRetrievable()
    {
        SetAuth(AuthA);
        var cmd = CreateValidDraftCommand("Draft for create test");

        var draftId = await CreateDraft(cmd);

        draftId.Should().NotBeEmpty();

        var draft = await GetDraft(draftId);
        draft.About.Should().Be("Draft for create test");
    }

    [Test]
    public async Task CreateDraft_WithoutAuth_ShouldReturnUnauthorized()
    {
        var client = _factory.CreateClient(); // no auth
        var cmd = CreateValidDraftCommand();

        var response = await client.PostAsJsonAsync($"{LoadBaseUrl}/draft", cmd);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    #endregion

    #region PUT /api/Load/draft/{id} — 2 tests

    [Test]
    public async Task UpdateDraft_ShouldModifyFields_AndReturnNewId()
    {
        SetAuth(AuthA);
        var draftId = await CreateDraft(CreateValidDraftCommand("Original draft"));

        var updateCmd = new UpdateLoadDraftCommand
        {
            Id = draftId,
            UserId = AuthA.UserId, // will be overwritten by controller anyway
            About = "Updated about text",
            Payment = 9999,
            StartDate = DateOnly.FromDateTime(DateTime.Now.AddDays(5))
        };

        var returnedId = await UpdateDraft(draftId, updateCmd);

        returnedId.Should().Be(draftId);

        var updated = await GetDraft(draftId);
        updated.About.Should().Be("Updated about text");
        updated.Payment.Should().Be(9999);
    }

    [Test]
    public async Task UpdateDraft_ByNonOwner_ShouldReturn403_Forbidden()
    {
        SetAuth(AuthA);
        var draftId = await CreateDraft(CreateValidDraftCommand("Owner draft"));

        SetAuth(AuthB);
        var updateCmd = new UpdateLoadDraftCommand
        {
            Id = draftId,
            About = "Hacked update"
        };

        var response = await Client.PutAsJsonAsync($"{LoadBaseUrl}/draft/{draftId}", updateCmd);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    #endregion

    #region DELETE /api/Load/{id} — 2 tests

    [Test]
    public async Task DeleteLoad_ShouldRemoveLoad_ForOwner()
    {
        SetAuth(AuthA);
        var loadId = await CreateLoad(CreateValidLoadCommand("To be deleted"));

        var deleteResponse = await DeleteLoad(loadId);
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify gone from my list
        var myLoads = await GetUserLoads();
        myLoads.Should().NotContain(l => l.Id == loadId);

        // Verify gone from public list
        var publicLoads = await GetAllLoads(anonymous: true);
        publicLoads.Should().NotContain(l => l.Id == loadId);
    }

    [Test]
    public async Task DeleteLoad_ByNonOwner_ShouldReturn403_Forbidden()
    {
        SetAuth(AuthA);
        var loadId = await CreateLoad(CreateValidLoadCommand("Owner only delete"));

        SetAuth(AuthB);
        var response = await DeleteLoad(loadId);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    #endregion

    #region DELETE /api/Load/draft/{id} — 2 tests

    [Test]
    public async Task DeleteDraft_ShouldRemoveDraft_ForOwner()
    {
        SetAuth(AuthA);
        var draftId = await CreateDraft(CreateValidDraftCommand("Draft to delete"));

        var response = await DeleteDraft(draftId);
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify 404 on get
        var getResponse = await Client.GetAsync($"{LoadBaseUrl}/draft/{draftId}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task DeleteDraft_ByNonOwner_ShouldReturn403()
    {
        SetAuth(AuthA);
        var draftId = await CreateDraft(CreateValidDraftCommand("Protected draft"));

        SetAuth(AuthB);
        var response = await DeleteDraft(draftId);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    #endregion
}
