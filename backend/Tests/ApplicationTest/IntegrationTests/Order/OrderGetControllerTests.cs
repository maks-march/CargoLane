using System.Net;
using Application.CQRS.OrderCQ.Commands.Create;
using Application.DTO.Order;
using Domain.Enums;
using FluentAssertions;

namespace ApplicationTest.IntegrationTests.Order;

[TestFixture]
public class OrderGetControllerTests : OrderTestBase
{
    [Test]
    public async Task Get_WithInvalidCredentials_ShouldBeNotFound()
    {
        var response = await Client.GetAsync($"{BaseUrl}/{Guid.NewGuid()}");
        
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
    
    [Test]
    public async Task Get_WithoutFilters_ShouldReturnAllOrders()
    {
        await PostValidOrder();
        await PostValidOrder();

        var response = await Client.GetAsync(BaseUrl);
        
        var orders = await ExtractFromResponse<OrderListVm[]>(response);
        
        orders.Should().NotBeNull();
        orders.Length.Should().BeGreaterThanOrEqualTo(2);
    }

    [Test]
    public async Task Get_ById_ValidId_ShouldReturnOrder()
    {
        var orderId = await PostValidOrder();

        var response = await Client.GetAsync($"{BaseUrl}/{orderId}");

        var order = await ExtractFromResponse<OrderDetailsVm>(response);
        order.Should().NotBeNull();
        order.Id.Should().Be(orderId);
    }

    [Test]
    public async Task Get_WithFilters_ShouldReturnFilteredOrders()
    {
        var city = "Moscow_" + Guid.NewGuid();
        var status = nameof(OrderStatus.AlwaysReady);
        
        await PostValidOrder(new CreateOrderCommand 
        { 
            Status = status,
            Payloads = [new PayloadCreateCommand { Weight = 10 }],
            RoutePoints = [new() { City = city }, new()]
        });
        
        await PostValidOrder(new CreateOrderCommand 
        {
            RoutePoints = [new() { City = "Not city" }, new()] 
        });

        var queryString = $"?StartCity={city}&Status={status}&MaxWeight=50";
        var response = await Client.GetAsync(BaseUrl + queryString);

        var result = await ExtractFromResponse<OrderListVm[]>(response);
        result.Should().HaveCount(1);
    }

    [Test]
    public async Task Get_FilterByDate_ShouldReturnOrdersAfterMinDate()
    {
        var targetDate = new DateOnly(3025, 05, 20);
        
        await PostValidOrder(new CreateOrderCommand { StartDate = targetDate });
        await PostValidOrder(new CreateOrderCommand { StartDate = new DateOnly(3025, 01, 01) });

        var response = await Client.GetAsync($"{BaseUrl}?MinStartDate={targetDate:yyyy-MM-dd}");
        
        var result = await ExtractFromResponse<OrderListVm[]>(response);
        result.Should().OnlyContain(x => x.StartDate >= targetDate);
    }

    [Test]
    public async Task Get_SortedByWeightDescending_ShouldReturnSortedList()
    {
        await PostValidOrder(new CreateOrderCommand { Payloads = [new PayloadCreateCommand { Weight = 100 }] });
        await PostValidOrder(new CreateOrderCommand { Payloads = [new PayloadCreateCommand { Weight = 500 }] });
        await PostValidOrder(new CreateOrderCommand { Payloads = [new PayloadCreateCommand { Weight = 200 }] });

        var response = await Client.GetAsync($"{BaseUrl}?SortBy=weight&IsAscending=false");

        var result = await ExtractFromResponse<OrderListVm[]>(response);
        result.Should().BeInDescendingOrder(x => x.TotalWeight);
    }

    [Test]
    public async Task Get_WithComplexFilter_ShouldReturnExactMatch()
    {
        var city = "Novosibirsk_" + Guid.NewGuid();
        var targetDate = new DateOnly(3024, 10, 10);
        
        await PostValidOrder(new CreateOrderCommand 
        { 
            RoutePoints = [new() { City = city }, new()],
            StartDate = targetDate,
            Payloads = [new PayloadCreateCommand { Weight = 5 }]
        });

        await PostValidOrder(new CreateOrderCommand 
        { 
            RoutePoints = [new() { City = city }, new()],
            StartDate = targetDate.AddDays(-5),
            Payloads = [new PayloadCreateCommand { Weight = 5 }]
        });

        var query = $"?StartCity={city}&MinStartDate={targetDate:yyyy-MM-dd}&MaxWeight=10";
        var response = await Client.GetAsync(BaseUrl + query);

        var result = await ExtractFromResponse<OrderListVm[]>(response);
        result.Should().HaveCount(1);
    }

    [Test]
    public async Task Get_ByEndCity_ShouldWorkCorrectly()
    {
        var destination = "Vladivostok_" + Guid.NewGuid();
        await PostValidOrder(new CreateOrderCommand { RoutePoints = [new(), new() { City = destination }] });
        await PostValidOrder(new CreateOrderCommand { RoutePoints = [new(), new() { City = "Sochi" }] });

        var response = await Client.GetAsync($"{BaseUrl}?EndCity={destination}");

        var result = await ExtractFromResponse<OrderListVm[]>(response);
        result.Should().OnlyContain(x => x.EndCity == destination);
    }

    [Test]
    public async Task Get_SortBySpecNumber_ShouldBeCorrect()
    {
        await PostValidOrder();
        await PostValidOrder();

        var response = await Client.GetAsync($"{BaseUrl}?SortBy=specnumber&IsAscending=true");

        var result = await ExtractFromResponse<OrderListVm[]>(response);
        result.Should().BeInAscendingOrder(x => x.SpecNumber);
    }

    [Test]
    public async Task Get_FilterByMaxWeight_BoundaryValue_ShouldBeInclusive()
    {
        double exactWeight = 42.5;
        await PostValidOrder(new CreateOrderCommand { Payloads = [new PayloadCreateCommand { Weight = exactWeight }] });
        await PostValidOrder(new CreateOrderCommand { Payloads = [new PayloadCreateCommand { Weight = exactWeight + 10 }] });

        var response = await Client.GetAsync($"{BaseUrl}?MaxWeight={exactWeight}");

        var result = await ExtractFromResponse<OrderListVm[]>(response);
        result.Should().OnlyContain(x => x.TotalWeight <= exactWeight);
    }

    [Test]
    public async Task Get_WhenNoOrdersMatchFilter_ShouldReturnEmptyArray()
    {
        await PostValidOrder(new CreateOrderCommand { RoutePoints = [new() { City = "RealCity" }, new()] });

        var response = await Client.GetAsync($"{BaseUrl}?StartCity=GhostCity");

        var result = await ExtractFromResponse<OrderListVm[]>(response);
        result.Should().BeEmpty();
    }
}