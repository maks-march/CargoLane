using System.Net.Http.Json;
using Application.CQRS.TruckCQ.Commands.Create;
using Application.DTO.Truck;
using ApplicationTest.Common;

namespace ApplicationTest.IntegrationTests.Truck;

public abstract class TruckTestBase : BaseIntegrationTest
{
    protected const string BaseUrl = "/api/Truck";

    // Хелпер для создания команды с дефолтными данными
    protected CreateTruckCommand GetTestCreateCommand(
        string bodyType = "Тент", 
        double cash = 1000, 
        int vehicles = 1) => new()
    {
        BodyType = bodyType,
        LoadType = new List<string> { "Задняя", "Боковая" },
        UnloadType = new List<string> { "Задняя" },
        Vehicles = vehicles,
        ByCash = cash,
        TaxedByCard = cash * 1.2,
        NotTaxedByCard = cash * 1.1,
        IsPaymentRequested = false,
        Adr = 0
    };

    // Хелпер для быстрой вставки грузовика в БД через API
    protected async Task<Guid> CreateTestTruck(CreateTruckCommand? command = null)
    {
        var cmd = command ?? GetTestCreateCommand();
        var response = await Client.PostAsJsonAsync(BaseUrl, cmd);
        return await ExtractFromResponse<Guid>(response);
    }
    
    [TearDown]
    protected async Task TearDown()
    {
        var response = await Client.GetAsync(BaseUrl);
        var result = await ExtractFromResponse<TruckListVm[]>(response);
        
        if (result == null)
            return;
        
        foreach (var truck in result)
        {
            await Client.DeleteAsync($"{BaseUrl}/{truck.Id}");
        }
    }
}