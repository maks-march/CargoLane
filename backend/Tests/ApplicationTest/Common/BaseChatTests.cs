using System.Net.Http.Headers;
using System.Net.Http.Json;
using Application.CQRS.LoadCQ.Commands.CreateLoad;
using Application.DTO.Auth;
using Application.DTO.Chat;

namespace ApplicationTest.Common;

public abstract class ChatTestBase : BaseIntegrationTest
{
    protected const string BaseUrl = "/api/Chat";

    protected string LoginA = "UserA_@gmail.com";
    protected string LoginB = "UserB_@gmail.com";
    protected string LoginC = "UserC_@gmail.com";

    protected AuthResponse AuthA;
    protected AuthResponse AuthB;
    protected AuthResponse AuthC;

    [OneTimeSetUp]
    public async Task OneTimeSetup()
    {
        AuthA = await Register(LoginA);
        AuthB = await Register(LoginB);
        AuthC = await Register(LoginC);
    }
    
    // Сброс на базового юзера из BaseIntegrationTest
    [TearDown]
    public void ResetAuth()
    {
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", Tokens.AccessToken);
    }

    // --- API Helpers ---
    protected async Task<Guid> StartChat(Guid targetUserId)
    {
        var response = await Client.PostAsync($"{BaseUrl}/start/{targetUserId}", null);
        return await ExtractFromResponse<Guid>(response);
    }

    protected async Task<Guid> SendMessage(Guid chatId, string text)
    {
        // Передаем строку как JSON ("текст")
        var response = await Client.PostAsJsonAsync($"{BaseUrl}/{chatId}/message", text);
        return await ExtractFromResponse<Guid>(response);
    }

    protected async Task<ChatVm[]> GetMyChats()
    {
        var response = await Client.GetAsync($"{ BaseUrl }/me");
        return await ExtractFromResponse<ChatVm[]>(response) ?? Array.Empty<ChatVm>();
    }

    protected async Task<MessageVm[]> GetHistory(Guid chatId, int skip = 0, int take = 50)
    {
        var response = await Client.GetAsync($"{BaseUrl}/{chatId}/messages?skip={skip}&take={take}");
        return await ExtractFromResponse<MessageVm[]>(response) ?? Array.Empty<MessageVm>();
    }

    // New helper for GET /api/Chat/{userId} (previously untested)
    protected async Task<ChatVm[]> GetChatsForUser(Guid userId)
    {
        var response = await Client.GetAsync($"{BaseUrl}/{userId}");
        return await ExtractFromResponse<ChatVm[]>(response) ?? Array.Empty<ChatVm>();
    }

    // Helper to start chat with loadId (previously untested path)
    protected async Task<Guid> StartChatWithLoad(Guid targetUserId, Guid loadId)
    {
        var response = await Client.PostAsync($"{BaseUrl}/start/{targetUserId}?loadId={loadId}", null);
        return await ExtractFromResponse<Guid>(response);
    }

    // Minimal helper to create a load for chat association tests (reuses LoadController logic)
    protected async Task<Guid> CreateLoadForChat(
        string about = "Chat load",
        string startCity = "Yekaterinburg",
        string endCity = "Moscow")
    {
        var command = new CreateLoadCommand
        {
            Payment = 1000,
            About = about,
            CargoType = about,
            VehicleTypes = [about],
            Distance = 1,
            Payloads = new List<PayloadInputDto>
            {
                new() { Length = 100, Width = 50, Height = 40, Weight = 200, Amount = 1, Type = "Boxes" }
            },
            RoutePoints = new List<RoutePointInputDto>
            {
                new() { City = startCity, Address = "Start", ArrivalTime = DateTime.UtcNow.AddDays(1) },
                new() { City = endCity, Address = "End", ArrivalTime = DateTime.UtcNow.AddDays(3) }
            }
        };

        var response = await Client.PostAsJsonAsync("/api/Load", command);
        return await ExtractFromResponse<Guid>(response);
    }
}