using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Application.DTO.Chat;
using ApplicationTest.Common;
using FluentAssertions;

namespace ApplicationTest.IntegrationTests;

public class ChatTests : BaseIntegrationTest
{
    private const string BaseUrl = "/api/Chat";

    [Test]
    public async Task FullChatLifecycle_TwoUsers_CanCommunicate()
    {
        // 1. Arrange: У нас есть Юзер А (Tokens из BaseIntegrationTest)
        // Регистрируем Юзера Б
        var userB = await Register("UserB_Login");
        userB.Should().NotBeNull();
        var userBId = await GetCurrentUserId(userB!.AccessToken);

        // 2. Юзер А начинает чат с Юзером Б
        var startResponse = await Client.PostAsync($"{BaseUrl}/start/{userBId}", null);
        var chatId = await ExtractFromResponse<Guid>(startResponse);
        chatId.Should().NotBeEmpty();

        // 3. Юзер А отправляет сообщение
        var messageText = "Привет, Юзер Б!";
        var sendResponse = await Client.PostAsJsonAsync($"{BaseUrl}/{chatId}/messages", messageText);
        sendResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // 4. Переключаемся на Юзера Б
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userB.AccessToken);

        // 5. Юзер Б проверяет список чатов
        var getChatsResponse = await Client.GetAsync(BaseUrl);
        var myChats = await ExtractFromResponse<ChatVm[]>(getChatsResponse);
        
        myChats.Should().ContainSingle(c => c.Id == chatId);
        myChats![0].LastMessageText.Should().Be(messageText);

        // 6. Юзер Б получает историю сообщений
        var historyResponse = await Client.GetAsync($"{BaseUrl}/{chatId}/messages");
        var messages = await ExtractFromResponse<MessageVm[]>(historyResponse);
        
        messages.Should().NotBeNull();
        messages!.Any(m => m.Text == messageText).Should().BeTrue();

        // 7. Юзер Б отвечает Юзеру А
        var replyText = "Привет, Юзер А! Как дела?";
        await Client.PostAsJsonAsync($"{BaseUrl}/{chatId}/messages", replyText);

        // Assert: Проверяем, что история теперь содержит 2 сообщения
        var finalHistoryResponse = await Client.GetAsync($"{BaseUrl}/{chatId}/messages");
        var finalMessages = await ExtractFromResponse<MessageVm[]>(finalHistoryResponse);
        finalMessages.Should().HaveCount(2);
    }

    [Test]
    public async Task Access_To_ForeignChat_Returns_Forbidden()
    {
        // Arrange: Юзер А и Юзер Б создают чат
        var userB = await Register("UserB_HackerTest");
        var userB_Id = await GetCurrentUserId(userB!.AccessToken);
        var startResponse = await Client.PostAsync($"{BaseUrl}/start/{userB_Id}", null);
        var chatId = await ExtractFromResponse<Guid>(startResponse);

        // Регистрируем Юзера В (Хакер)
        var userC = await Register("UserC_Hacker");
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userC!.AccessToken);

        // Act: Хакер пытается прочитать историю чата А и Б
        var response = await Client.GetAsync($"{BaseUrl}/{chatId}/messages");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    #region Helpers
    
    // Вспомогательный метод, чтобы узнать свой Guid из токена (нужен для тестов)
    private async Task<Guid> GetCurrentUserId(string token)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/Auth/me"); // Предположим, есть такой эндпоинт
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var response = await Client.SendAsync(request);
        // Или просто декодировать JWT в тесте
        return Guid.Parse("..."); // Для примера. Обычно ID возвращается при регистрации/логине.
    }
    
    #endregion
}