using System.Net.Http.Json;
using Application.CQRS.OrderCQ.Commands.Create;
using Application.DTO.Order;
using ApplicationTest.Common;
using FluentAssertions;
using WebApi.DTO;

namespace ApplicationTest.IntegrationTests.Order;

public abstract class OrderTestBase : BaseIntegrationTest
{
    protected const string BaseUrl = "/api/Order";
    protected async Task<Guid> PostValidOrder(CreateOrderCommand? command = null)
    {
        var response = await PostOrder(command);
        return await ExtractFromResponse<Guid>(response);
    }

    protected async Task<HttpResponseMessage> PostOrder(CreateOrderCommand? createDto = null)
    {
        createDto = createDto ?? new CreateOrderCommand()
        {
            Payloads = [new PayloadCreateCommand()],
            RoutePoints = [new RoutePointVm(), new RoutePointVm()]
        };
        
        return await Client.PostAsJsonAsync(BaseUrl, createDto);
    }
    protected bool CheckProps<T, TPayload, TPayment, TTransport, TRoutePoint>(ErrorResponse? error)
    {
        error.Should().NotBeNull();
        
        error.Error.Should().NotBeEmpty();
        var props = typeof(T).GetProperties()
            .Concat(typeof(T).GetProperties()).Concat(typeof(TPayload).GetProperties())
            .Concat(typeof(T).GetProperties()).Concat(typeof(TPayment).GetProperties())
            .Concat(typeof(T).GetProperties()).Concat(typeof(TTransport).GetProperties())
            .Concat(typeof(T).GetProperties()).Concat(typeof(TRoutePoint).GetProperties());
        return props
            .Where(p => p.PropertyType != typeof(Guid) && p.PropertyType != typeof(bool)
                                                       && p.PropertyType != typeof(Guid?) && p.PropertyType != typeof(bool?))
            .Select(p => p.Name)
            .Where(name => !name.Contains("Temperature") && !name.Contains("LoadTime"))
            .All(name =>
            {
                Console.WriteLine(name);
                return error.Error.Contains(name);
            });
    }
    
    [TearDown]
    public async Task TearDown()
    {
        var response = await Client.GetAsync(BaseUrl);
        var result = await ExtractFromResponse<OrderListVm[]>(response);
        
        if (result == null)
            return;
        
        foreach (var order in result)
        {
            await Client.DeleteAsync($"{BaseUrl}/{order.Id}");
        }
    }
}