using System.Net.Http.Headers;
using System.Net.Http.Json;
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
    
    // Хелпер для смены токена
    protected void SetAuth(AuthResponse auth)
    {
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", auth.AccessToken);
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
}