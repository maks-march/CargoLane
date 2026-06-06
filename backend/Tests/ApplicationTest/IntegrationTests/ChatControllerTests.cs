using System.Net;
using System.Net.Http.Headers;
using ApplicationTest.Common;
using FluentAssertions;

namespace ApplicationTest.IntegrationTests;

public class ChatControllerTests : BaseChatTests
{
    [Test]
    public async Task TwoUsers_CanStartChat_And_ExchangeMessages()
    {
        // 1. Arrange: У нас есть Юзер А (автоматически создан в BaseIntegrationTest)
        // Регистрируем Юзера Б и получаем его данные
        var userB_Login = "UserB_" + Guid.NewGuid();
        var userB_Tokens = await Register(userB_Login);
        
        // Нам нужно узнать Id Юзера Б. 
        // В реальном проекте ID обычно возвращается в AuthResponse или есть эндпоинт /me
        // Для теста предположим, что мы можем его достать из БД через scope или он в Tokens.UserId
        var userB_Id = userB_Tokens!.UserId; 

        // 2. Act: Юзер А начинает чат с Юзером Б
        var chatId = await StartChat(userB_Id);
        chatId.Should().NotBeEmpty();

        // 3. Юзер А отправляет сообщение
        var textFromA = "Привет, Юзер Б!";
        await SendMessage(chatId, textFromA);

        // 4. Переключаемся на Юзера Б (меняем токен в клиенте)
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", userB_Tokens.AccessToken);

        // 5. Юзер Б проверяет список чатов
        var chatsOfB = await GetMyChats();
        chatsOfB.Should().ContainSingle();
        chatsOfB[0].LastMessageText.Should().Be(textFromA);
        chatsOfB[0].Id.Should().Be(chatId);

        // 6. Юзер Б отвечает Юзеру А
        var textFromB = "Привет, Юзер А! Получил сообщение.";
        await SendMessage(chatId, textFromB);

        // 7. Юзер Б проверяет историю
        var history = await GetHistory(chatId);
        history.Should().HaveCount(2);
        history[0].Text.Should().Be(textFromB); // Последнее сообщение первым (OrderByDescending)
        history[1].Text.Should().Be(textFromA);
    }

    [Test]
    public async Task ChatHistory_AccessIsForbidden_ForNonParticipant()
    {
        // 1. Юзер А создает чат с Юзером Б
        var userB = await Register("UserB_" + Guid.NewGuid());
        var chatId = await StartChat(userB!.UserId);

        // 2. Регистрируем Юзера В (Хакер)
        var userC = await Register("UserC_Hacker");
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", userC!.AccessToken);

        // 3. Act: Хакер пытается прочитать историю чужого чата
        var response = await Client.GetAsync($"{BaseUrl}/{chatId}/messages");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Test]
    public async Task StartChat_WithExistingUser_ReturnsSameChatId()
    {
        // Arrange
        var userB = await Register("UserB_RepeatTest");
        var userB_Id = userB!.UserId;

        // Act
        var firstId = await StartChat(userB_Id);
        var secondId = await StartChat(userB_Id);

        // Assert
        firstId.Should().Be(secondId); // Чат не должен дублироваться
    }

    [Test]
    public async Task GetHistory_WithInvalidChatId_ReturnsNotFound()
    {
        // Act
        var response = await Client.GetAsync($"{BaseUrl}/{Guid.NewGuid()}/messages");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}