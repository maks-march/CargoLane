using System.Net;
using System.Net.Http.Json;
using Application.DTO.Chat;
using FluentAssertions;

namespace ApplicationTest.IntegrationTests.Chat;

public class ChatTests : ChatTestBase
{
    [Test]
    public async Task FullCommunicationCycle_Between_UserA_And_UserB()
    {
        // 1. Юзер А начинает чат с Юзером Б
        SetAuth(AuthA);
        var chatId = await StartChat(AuthB.UserId);
        chatId.Should().NotBeEmpty();

        // 2. Юзер А отправляет сообщение
        var textA = "Привет от Юзера А";
        await SendMessage(chatId, textA);

        // 3. Переключаемся на Юзера Б
        SetAuth(AuthB);

        // Юзер Б видит чат и непрочитанное сообщение
        var chatsB = await GetMyChats();
        var chatB = chatsB.FirstOrDefault(c => c.Id == chatId);
        chatB.Should().NotBeNull();
        chatB.UnreadCount.Should().Be(1);
        chatB.LastMessageText.Should().Be(textA);

        // Юзер Б читает историю
        var historyB = await GetHistory(chatId);
        historyB.Should().ContainSingle(m => m.Text == textA && m.SenderId == AuthA.UserId);

        // 4. Юзер Б отвечает
        var textB = "Ответ от Юзера Б";
        await SendMessage(chatId, textB);

        // 5. Возвращаемся к Юзеру А
        SetAuth(AuthA);
        var chatsA = await GetMyChats();
        chatsA[0].LastMessageText.Should().Be(textB);
    }

    [Test]
    public async Task Security_UserC_CannotRead_UserA_And_UserB_Chat()
    {
        // 1. Юзер А создает чат с Юзером Б
        SetAuth(AuthA);
        var chatId = await StartChat(AuthB.UserId);

        // 2. Переключаемся на Юзера В (который не в чате)
        SetAuth(AuthC);

        // 3. Пытаемся получить историю чужого чата
        var response = await Client.GetAsync($"{BaseUrl}/{chatId}/messages");

        // Assert: Должен быть Forbidden (403)
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Test]
    public async Task Pagination_ShouldWork_With_MultipleMessages()
    {
        // 1. Подготовка: Юзер А шлет 10 сообщений Юзеру Б
        SetAuth(AuthA);
        var chatId = await StartChat(AuthB.UserId);
        
        for (int i = 1; i <= 10; i++)
        {
            await SendMessage(chatId, $"Message {i}");
        }

        // 2. Проверяем пагинацию (Берем 5 последних)
        var history = await GetHistory(chatId, skip: 0, take: 5);
        
        history.Should().HaveCount(5);
        history[0].Text.Should().Be("Message 10"); // Сортировка по убыванию
        history[4].Text.Should().Be("Message 6");
    }

    [Test]
    public async Task StartChat_WithSelf_ReturnsBadRequest()
    {
        // Act: Юзер А пытается начать чат с самим собой
        SetAuth(AuthA);
        var response = await Client.PostAsync($"{BaseUrl}/start/{AuthA.UserId}", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Test]
    public async Task SendMessage_To_NonExistentChat_ReturnsNotFound()
    {
        // Act: Юзер А шлет сообщение в случайный Guid
        SetAuth(AuthA);
        var response = await Client.PostAsJsonAsync($"{BaseUrl}/{Guid.NewGuid()}/messages", "Hello");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}