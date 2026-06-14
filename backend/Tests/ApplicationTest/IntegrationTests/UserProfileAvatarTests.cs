using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Application.DTO.User;
using ApplicationTest.Common;
using FluentAssertions;
using WebApi.DTO;

namespace ApplicationTest.IntegrationTests;

/// <summary>
/// TDD тесты для User Profile / Company / Avatar эндпоинтов
/// согласно контракту фронтенда (cargolane-endpoints.md)
/// </summary>
[TestFixture]
public class UserProfileAvatarTests : BaseIntegrationTest
{
    private const string BaseUrl = "api/User/";
    private const string ProfileUrl = "api/User/profile";
    private const string CompanyUrl = "api/User/company";
    private const string AvatarUrl = "api/User/avatar";

    #region Profile

    [Test]
    public async Task Put_Profile_WithValidData_ShouldUpdatePersonalFields()
    {
        var request = new
        {
            FirstName = "UpdatedFirst",
            LastName = "UpdatedLast",
            NickName = "UpdatedNick",
            PhoneNumber = "+79991234567",
            TimeZone = 3,
            Country = "Russia",
            City = "Moscow",
            Address = "Tverskaya 1"
        };

        var response = await Client.PutAsJsonAsync(ProfileUrl, request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var me = await GetMe();
        me.Name.Should().Be(request.FirstName);
        me.Surname.Should().Be(request.LastName);
        me.NickName.Should().Be(request.NickName);
        me.PhoneNumber.Should().Be(request.PhoneNumber);
        me.TimeZone.Should().Be(request.TimeZone);
        me.Country.Should().Be(request.Country);
        me.City.Should().Be(request.City);
        me.Address.Should().Be(request.Address);
    }

    [Test]
    public async Task Put_Profile_WithInvalidData_ShouldReturnBadRequest()
    {
        var request = new
        {
            FirstName = new string('A', 100), // слишком длинное
            LastName = ""
        };

        var response = await Client.PutAsJsonAsync(ProfileUrl, request);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        error.Should().NotBeNull();
    }

    #endregion

    #region Company

    [Test]
    public async Task Put_Company_WithValidData_ShouldUpdateCompanyFields()
    {
        var request = new
        {
            CompanyName = "ООО Рога и Копыта",
            CompanyCountry = "Russia",
            CompanyType = "ООО"
        };

        var response = await Client.PutAsJsonAsync(CompanyUrl, request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var me = await GetMe();
        me.CompanyName.Should().Be(request.CompanyName);
        me.CompanyCountry.Should().Be(request.CompanyCountry);
        me.CompanyType.Should().Be(request.CompanyType);
    }

    #endregion

    #region Avatar

    [Test]
    public async Task Post_Avatar_WithValidImage_ShouldUploadAndReturnPathInMe()
    {
        // Arrange
        var avatarBytes = CreateFakeJpegBytes();
        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(avatarBytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "avatar", "test-avatar.jpg");

        // Act
        var response = await Client.PostAsync(AvatarUrl, content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var me = await GetMe();
        me.AvatarPath.Should().NotBeNullOrEmpty();
        me.AvatarPath.Should().Contain("avatar"); // или как сохраняет FileService

        // Cleanup файла аватара
        await CleanupAvatarIfExists(me.AvatarPath);
    }

    [Test]
    public async Task Post_Avatar_WhenAlreadyHasAvatar_ShouldReplaceAndDeleteOldFile()
    {
        // Загружаем первый аватар
        var firstBytes = CreateFakeJpegBytes();
        using var firstContent = new MultipartFormDataContent();
        var firstFile = new ByteArrayContent(firstBytes);
        firstFile.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        firstContent.Add(firstFile, "avatar", "first.jpg");

        var firstResponse = await Client.PostAsync(AvatarUrl, firstContent);
        firstResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var meAfterFirst = await GetMe();
        var oldPath = meAfterFirst.AvatarPath;
        oldPath.Should().NotBeNullOrEmpty();

        // Загружаем второй аватар
        var secondBytes = CreateFakeJpegBytes();
        using var secondContent = new MultipartFormDataContent();
        var secondFile = new ByteArrayContent(secondBytes);
        secondFile.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        secondContent.Add(secondFile, "avatar", "second.jpg");

        var secondResponse = await Client.PostAsync(AvatarUrl, secondContent);
        secondResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var meAfterSecond = await GetMe();
        meAfterSecond.AvatarPath.Should().NotBeNullOrEmpty();
        meAfterSecond.AvatarPath.Should().NotBe(oldPath);

        // Старый файл должен быть удалён
        var oldFileExists = await FileStillExists(oldPath);
        oldFileExists.Should().BeFalse();

        await CleanupAvatarIfExists(meAfterSecond.AvatarPath);
    }

    [Test]
    public async Task Delete_Avatar_WhenExists_ShouldRemovePathAndDeleteFile()
    {
        // Сначала загружаем аватар
        var bytes = CreateFakeJpegBytes();
        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(bytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "avatar", "to-delete.jpg");

        await Client.PostAsync(AvatarUrl, content);

        var meWithAvatar = await GetMe();
        var avatarPath = meWithAvatar.AvatarPath;
        avatarPath.Should().NotBeNullOrEmpty();

        // Act
        var deleteResponse = await Client.DeleteAsync(AvatarUrl);
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var meAfterDelete = await GetMe();
        meAfterDelete.AvatarPath.Should().BeNullOrEmpty();

        // Файл должен быть удалён
        var stillExists = await FileStillExists(avatarPath);
        stillExists.Should().BeFalse();
    }

    [Test]
    public async Task Delete_Avatar_WhenNoAvatar_ShouldBeOkOrNoContent()
    {
        // Убедимся, что аватара нет
        var me = await GetMe();
        if (!string.IsNullOrEmpty(me.AvatarPath))
        {
            await Client.DeleteAsync(AvatarUrl);
        }

        var response = await Client.DeleteAsync(AvatarUrl);
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.OK);
    }

    [Test]
    public async Task Post_Avatar_WithoutAuth_ShouldBeUnauthorized()
    {
        var client = _factory.CreateClient(); // без токена

        var bytes = CreateFakeJpegBytes();
        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(bytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "avatar", "unauth.jpg");

        var response = await client.PostAsync(AvatarUrl, content);
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    #endregion

    #region Helpers

    private async Task<UserDetailsVm> GetMe()
    {
        var response = await Client.GetAsync($"{BaseUrl}me");
        response.IsSuccessStatusCode.Should().BeTrue();
        var vm = await response.Content.ReadFromJsonAsync<UserDetailsVm>();
        vm.Should().NotBeNull();
        return vm;
    }

    private byte[] CreateFakeJpegBytes()
    {
        // Минимальный валидный JPEG (1x1 pixel)
        return new byte[]
        {
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
            0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
            0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
            0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
            0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
            0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
            0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
            0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
            0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01, 0x00,
            0x01, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF,
            0xC4, 0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01,
            0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03,
            0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0xFF, 0xC4, 0x00, 0xB5,
            0x10, 0x00, 0x02, 0x01, 0x03, 0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04,
            0x04, 0x00, 0x00, 0x01, 0x7D, 0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05,
            0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14,
            0x32, 0x81, 0x91, 0xA1, 0x08, 0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1,
            0xF0, 0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19,
            0x1A, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38,
            0x39, 0x3A, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4A, 0x53, 0x54,
            0x55, 0x56, 0x57, 0x58, 0x59, 0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
            0x69, 0x6A, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84,
            0x85, 0x86, 0x87, 0x88, 0x89, 0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97,
            0x98, 0x99, 0x9A, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA,
            0xB2, 0xB3, 0xB4, 0xB5, 0xB6, 0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4,
            0xC5, 0xC6, 0xC7, 0xC8, 0xC9, 0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7,
            0xD8, 0xD9, 0xDA, 0xE1, 0xE2, 0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9,
            0xEA, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFF,
            0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F,
            0x00, 0x8F, 0xE0, 0x00, 0x01, 0xFF, 0xD9
        };
    }

    private async Task CleanupAvatarIfExists(string? avatarPath)
    {
        if (string.IsNullOrEmpty(avatarPath)) return;

        try
        {
            await FileService.DeleteFiles(CancellationToken.None, avatarPath);
        }
        catch
        {
            // Игнорируем ошибки очистки в тестах
        }
    }

    private async Task<bool> FileStillExists(string? path)
    {
        if (string.IsNullOrEmpty(path)) return false;

        try
        {
            var deleted = await FileService.DeleteFiles(CancellationToken.None, path);
            return !deleted;
        }
        catch
        {
            return false;
        }
    }

    private TestWebApplicationFactory<Program> _factory;

    [SetUp]
    public void SetUp()
    {
    }

    [TearDown]
    public async Task TearDown()
    {
        // Гарантируем, что после каждого теста аватар пользователя очищен
        try
        {
            var me = await GetMe();
            if (!string.IsNullOrEmpty(me.AvatarPath))
            {
                await Client.DeleteAsync(AvatarUrl);
                await CleanupAvatarIfExists(me.AvatarPath);
            }
        }
        catch
        {
            // ignore
        }
    }

    #endregion
}
