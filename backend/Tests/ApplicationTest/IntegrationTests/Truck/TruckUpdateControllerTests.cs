using System.Net;
using System.Net.Http.Json;
using Application.CQRS.TruckCQ.Commands.Update;
using Application.DTO.Truck;
using FluentAssertions;

namespace ApplicationTest.IntegrationTests.Truck;

public class TruckPatchTests : TruckTestBase
{
    [Test]
    public async Task Patch_ValidUpdate_UpdatesOnlySpecifiedFields()
    {
        // Arrange
        var truckId = await CreateTestTruck(GetTestCreateCommand(bodyType: "Старый тип", vehicles: 1));
        var updateCmd = new UpdateTruckCommand 
        { 
            Id = truckId, 
            BodyType = "Новый тип"
        };

        // Act
        var response = await Client.PatchAsJsonAsync($"{BaseUrl}/{truckId}", updateCmd);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Assert
        var getResponse = await Client.GetAsync($"{BaseUrl}/{truckId}");
        var updated = await ExtractFromResponse<TruckDetailsVm>(getResponse);
        
        updated.Should().NotBeNull();
        updated.BodyType.Should().Be("Новый тип");
        updated.Vehicles.Should().Be(1); // Осталось прежним
    }

    [Test]
    public async Task Patch_NonExistentTruck_ReturnsNotFound()
    {
        var updateCmd = new UpdateTruckCommand { Id = Guid.NewGuid(), BodyType = "Fail" };
        var response = await Client.PatchAsJsonAsync($"{BaseUrl}/{updateCmd.Id}", updateCmd);
        
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task Patch_Unauthorized_ReturnsUnauthorized()
    {
        var truckId = await CreateTestTruck();
        var auth = Client.DefaultRequestHeaders.Authorization;
        Client.DefaultRequestHeaders.Authorization = null; // Сбрасываем токен

        var updateCmd = new UpdateTruckCommand { Id = truckId, BodyType = "Anonymous" };
        var response = await Client.PatchAsJsonAsync($"{BaseUrl}/{truckId}", updateCmd);

        Client.DefaultRequestHeaders.Authorization = auth;
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}