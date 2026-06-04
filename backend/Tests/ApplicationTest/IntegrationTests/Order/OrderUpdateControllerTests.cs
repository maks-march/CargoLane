using System.Net;
using System.Net.Http.Json;
using Application.Common.Extensions;
using Application.CQRS.OrderCQ.Commands.Update;
using Application.DTO.Order;
using ApplicationTest.Extensions;
using Domain.Enums;
using FluentAssertions;
using WebApi.DTO;

namespace ApplicationTest.IntegrationTests.Order;

public class OrderUpdateControllerTests : OrderTestBase
{
    private async Task<(OrderDetailsVm order, OrderDetailsVm updated)> PrepareVm(UpdateOrderCommand command)
    {
        var id = await PostValidOrder();
        
        var orderResponse = await Client.GetAsync($"{BaseUrl}/{id}");
        var orderVm = await ExtractFromResponse<OrderDetailsVm>(orderResponse);

        var updateResponse = await Client.PatchAsJsonAsync($"{BaseUrl}/{id}", command);
        var updateId = await ExtractFromResponse<Guid>(updateResponse);
        
        var updatedResponse = await Client.GetAsync($"{BaseUrl}/{updateId}");
        var updatedVm = await ExtractFromResponse<OrderDetailsVm>(updatedResponse);
        
        orderVm.Should().NotBeNull();
        updatedVm.Should().NotBeNull();
        return (orderVm, updatedVm);
    }

    
    [Test]
    public async Task Update_WithEmptyCredentials_ShouldBeOk()
    {
        var (orderVm, updatedVm) = await PrepareVm(new UpdateOrderCommand());
        orderVm.Updated.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(10));
        updatedVm.Should().BeEquivalentTo(orderVm, options => 
            options.Excluding(x => x.Updated));
    }
    
    [Test]
    public async Task Update_WithValidCredentials_ShouldBeOk()
    {
        var str = "Update_ShouldBeOk";
        var (orderVm, updatedVm) = await PrepareVm(new UpdateOrderCommand
        {
            StartDate = DateTime.Now.AddDays(2).ToDateOnly(),
            Status = nameof(OrderStatus.NoCargo),
            About = str,
            SpecNumber = 1000,
            Payment = new PaymentUpdateCommand
            {
                PaymentType = nameof(PaymentType.Negotiable),
                IsTaxedByCard = true,
                IsNotTaxedByCard = true,
                IsByCash = true,
                TaxedByCard = 100,
                NotTaxedByCard = 100,
                ByCash = 100,
                IsVisible = true,
                PaymentAfterDays = 5,
                Prepayment = 10.5,
                IsPrepaymentByFuel = true
            },
            Transport = new TransportUpdateCommand
            {
                BodyType = [str],
                LoadType = [str],
                UnloadType = [str],
                Vehicles = 3,
                TemperatureFrom = -5,
                TemperatureTo = 10,
                IsCrewFull = true,
                Adr = 5,
                IsHitch = true,
                IsPneumaticVehicle = true,
                IsStakes = true,
                IsTir = true,
                IsT1 = true,
                IsCmr = true,
                IsMedicalBook = true
            },
            Payloads = [
                new PayloadUpdateCommand
                {
                    Name = str,
                    Weight = 2,
                    Volume = 3,
                    Amount = 4,
                    Wrap = nameof(Wrap.Barrels)
                },
                new PayloadUpdateCommand
                {
                    Name = str,
                    Weight = 4,
                    Volume = 2,
                    Amount = 2,
                    Wrap = nameof(Wrap.Bulk)
                }
            ],
            RoutePoints = [
                new RoutePointUpdateCommand
                {
                    City = str,
                    Address = str,
                    LoadTimeStart = TimeSpan.MinValue,
                    LoadTimeEnd = TimeSpan.MaxValue,
                    Date = DateTime.Today.AddDays(2).ToDateOnly(),
                    IsLoad = true
                },
                new RoutePointUpdateCommand
                {
                    City = str,
                    Address = str,
                    LoadTimeStart = TimeSpan.MinValue,
                    LoadTimeEnd = TimeSpan.MaxValue,
                    Date = DateTime.Today.AddDays(3).ToDateOnly(),
                    IsLoad = false
                },
                new RoutePointUpdateCommand
                {
                    City = str,
                    Address = str,
                    LoadTimeStart = TimeSpan.MinValue,
                    LoadTimeEnd = TimeSpan.MaxValue,
                    Date = DateTime.Today.AddDays(4).ToDateOnly(),
                    IsLoad = false
                },
            ]
        });
        updatedVm.Updated.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(10));
        updatedVm.CheckDifference(orderVm).Should().BeTrue();
    }

    [Test]
    public async Task Update_WithInvalidCredentials_ShouldBeBadRequest()
    {
        var tooBigString = string.Concat(Enumerable.Repeat("Update_WithInvalidCredentials_ShouldBeBadRequest", 20));
        var id = await PostValidOrder();
        var command = new UpdateOrderCommand()
        {
            UserId = Guid.Empty,
            StartDate = DateTime.Now.AddDays(-1).ToDateOnly(),
            Status = tooBigString,
            About = tooBigString,
            SpecNumber = -1,
            Payment = new PaymentUpdateCommand()
            {
                PaymentType = tooBigString,
                TaxedByCard = -1,
                NotTaxedByCard = -1,
                ByCash = -1,
                PaymentAfterDays = -1,
                Prepayment = -1
            },
            Transport = new TransportUpdateCommand
            {
                BodyType = [tooBigString],
                LoadType = [tooBigString],
                UnloadType = [tooBigString],
                Vehicles = -1,
                TemperatureFrom = -1,
                TemperatureTo = -3,
                Adr = -1
            },
            Payloads = [new PayloadUpdateCommand()
                {
                    Name = tooBigString,
                    Weight = -1,
                    Volume = -1,
                    Amount = -1,
                    Wrap = tooBigString
                }
            ],
            RoutePoints = [
                new RoutePointUpdateCommand()
                {
                    City = tooBigString,
                    Address = tooBigString,
                    LoadTimeStart = TimeSpan.MaxValue,
                    LoadTimeEnd = TimeSpan.MinValue,
                    Date = DateTime.Today.AddDays(-1).ToDateOnly(),
                    IsLoad = false
                }, new RoutePointUpdateCommand()
            ]
        };
        var updateResponse = await Client.PatchAsJsonAsync($"{BaseUrl}/{id}", command);
        
        updateResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var error = await updateResponse.Content.ReadFromJsonAsync<ErrorResponse>();
        
        CheckProps<
            UpdateOrderCommand, 
            PayloadUpdateCommand, 
            PaymentUpdateCommand, 
            TransportUpdateCommand, 
            RoutePointUpdateCommand>(error).Should().BeTrue();
    }
}