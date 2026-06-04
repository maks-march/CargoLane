using System.Net;
using Application.DTO.Truck;
using FluentAssertions;

namespace ApplicationTest.IntegrationTests.Truck;

public class TruckGetTests : TruckTestBase
{
    [Test]
    public async Task GetById_ExistingId_ReturnsCorrectDetails()
    {
        var truckId = await CreateTestTruck(GetTestCreateCommand(bodyType: "Рефрижератор"));

        var response = await Client.GetAsync($"{BaseUrl}/{truckId}");
        var result = await ExtractFromResponse<TruckDetailsVm>(response);

        result.Should().NotBeNull();
        result.Id.Should().Be(truckId);
        result.BodyType.Should().Be("Рефрижератор");
    }

    [Test]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        var response = await Client.GetAsync($"{BaseUrl}/{Guid.NewGuid()}");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task GetList_FilterByPrice_ReturnsFilteredResults()
    {
        // Arrange: создаем один дешевый и один дорогой
        await CreateTestTruck(GetTestCreateCommand(cash: 100));
        await CreateTestTruck(GetTestCreateCommand(cash: 10000));

        // Act: просим только до 500
        var response = await Client.GetAsync($"{BaseUrl}?PriceTo=500");
        var result = await ExtractFromResponse<TruckListVm[]>(response);

        // Assert
        result.Should().NotBeNull();
        result.All(t => t.MaxPayment <= 500).Should().BeTrue();
    }

    [Test]
    public async Task GetList_SortByCostDesc_ReturnsCorrectOrder()
    {
        await CreateTestTruck(GetTestCreateCommand(cash: 500));
        await CreateTestTruck(GetTestCreateCommand(cash: 1500));

        var response = await Client.GetAsync($"{BaseUrl}?SortBy=cost");
        var result = await ExtractFromResponse<TruckListVm[]>(response);

        result.Should().NotBeNull();
        result.Length.Should().Be(2);
        result[0].MinPayment.Should().BeGreaterThan(result[1].MinPayment);
    }
}