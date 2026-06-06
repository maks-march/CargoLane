using System.Net.Http.Json;
using Application.DTO.Chat;

namespace ApplicationTest.Common;

public abstract class BaseChatTests : BaseIntegrationTest
{
    protected const string BaseUrl = "/api/Chat";

    // Начать чат с пользователем
    protected async Task<Guid> StartChat(Guid targetUserId)
    {
        var response = await Client.PostAsync($"{BaseUrl}/start/{targetUserId}", null);
        return await ExtractFromResponse<Guid>(response);
    }

    // Отправить сообщение в чат
    protected async Task<Guid> SendMessage(Guid chatId, string text)
    {
        var response = await Client.PostAsJsonAsync($"{BaseUrl}/{chatId}/messages", text);
        return await ExtractFromResponse<Guid>(response);
    }

    // Получить список моих чатов
    protected async Task<ChatVm[]> GetMyChats()
    {
        var response = await Client.GetAsync(BaseUrl);
        return await ExtractFromResponse<ChatVm[]>(response) ?? Array.Empty<ChatVm>();
    }

    // Получить историю сообщений
    protected async Task<MessageVm[]> GetHistory(Guid chatId)
    {
        var response = await Client.GetAsync($"{BaseUrl}/{chatId}/messages");
        return await ExtractFromResponse<MessageVm[]>(response) ?? Array.Empty<MessageVm>();
    }
}