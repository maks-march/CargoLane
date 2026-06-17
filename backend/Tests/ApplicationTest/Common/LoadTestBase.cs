using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Application.CQRS.LoadCQ.Commands;
using Application.CQRS.LoadCQ.Commands.CreateLoad;
using Application.CQRS.LoadCQ.Commands.Draft.Create;
using Application.DTO.Auth;
using Application.DTO.Load;
using ApplicationTest.Common;
using Domain.Models.Load;
using FluentAssertions;

namespace ApplicationTest.Common;

public abstract class LoadTestBase : BaseIntegrationTest
{
    protected const string LoadBaseUrl = "/api/Load";

    protected AuthResponse AuthA;
    protected AuthResponse AuthB;
    protected AuthResponse AuthC;

    [OneTimeSetUp]
    public async Task LoadOneTimeSetup()
    {
        AuthA = await Register("LoadUserA_2026@mail.ru");
        AuthB = await Register("LoadUserB_2026@mail.ru");
        AuthC = await Register("LoadUserC_2026@mail.ru");
    }

    protected void SetAuth(AuthResponse auth)
    {
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", auth.AccessToken);
    }

    [TearDown]
    public void ResetLoadAuth()
    {
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", Tokens.AccessToken);
    }

    // --- Public list (GET /api/Load) ---
    protected async Task<LoadListVm[]> GetAllLoads(bool anonymous = false)
    {
        var client = anonymous ? _factory.CreateClient() : Client;
        var response = await client.GetAsync(LoadBaseUrl);
        return await ExtractFromResponse<LoadListVm[]>(response) ?? Array.Empty<LoadListVm>();
    }

    protected async Task<LoadListVm[]> GetAllLoadsWithFilter(
        string? startCity = null, 
        string? endCity = null, 
        string? status = null)
    {
        var queryParams = new List<string>();
        if (!string.IsNullOrEmpty(startCity)) queryParams.Add($"StartCity={Uri.EscapeDataString(startCity)}");
        if (!string.IsNullOrEmpty(endCity)) queryParams.Add($"EndCity={Uri.EscapeDataString(endCity)}");
        if (!string.IsNullOrEmpty(status)) queryParams.Add($"Status={status}");
        
        var query = queryParams.Any() ? "?" + string.Join("&", queryParams) : "";
        var response = await Client.GetAsync($"{LoadBaseUrl}{query}");
        return await ExtractFromResponse<LoadListVm[]>(response) ?? Array.Empty<LoadListVm>();
    }

    // --- User loads ---
    protected async Task<LoadListVm[]> GetUserLoads()
    {
        var response = await Client.GetAsync($"{LoadBaseUrl}/me");
        return await ExtractFromResponse<LoadListVm[]>(response) ?? Array.Empty<LoadListVm>();
    }

    protected async Task<LoadListVm[]> GetMyLoads()
    {
        var response = await Client.GetAsync($"{LoadBaseUrl}/me");
        return await ExtractFromResponse<LoadListVm[]>(response) ?? Array.Empty<LoadListVm>();
    }

    // --- Details (public) ---
    protected async Task<LoadDetailsVm> GetLoadDetails(Guid id, bool anonymous = false)
    {
        var client = anonymous ? _factory.CreateClient() : Client;
        var response = await client.GetAsync($"{LoadBaseUrl}/{id}");
        return await ExtractFromResponse<LoadDetailsVm>(response);
    }

    // --- Drafts ---
    protected async Task<LoadDraftVm> GetDraft(Guid id)
    {
        var response = await Client.GetAsync($"{LoadBaseUrl}/draft/{id}");
        return await ExtractFromResponse<LoadDraftVm>(response);
    }

    // --- Create ---
    protected async Task<Guid> CreateLoad(CreateLoadCommand command)
    {
        var response = await Client.PostAsJsonAsync(LoadBaseUrl, command);
        return await ExtractFromResponse<Guid>(response);
    }

    protected async Task<Guid> CreateDraft(CreateLoadDraftCommand command)
    {
        var response = await Client.PostAsJsonAsync($"{LoadBaseUrl}/draft", command);
        return await ExtractFromResponse<Guid>(response);
    }

    // --- Update draft ---
    protected async Task<Guid> UpdateDraft(Guid id, UpdateLoadDraftCommand command)
    {
        var response = await Client.PutAsJsonAsync($"{LoadBaseUrl}/draft/{id}", command);
        return await ExtractFromResponse<Guid>(response);
    }

    // --- Delete ---
    protected async Task<HttpResponseMessage> DeleteLoad(Guid id)
    {
        return await Client.DeleteAsync($"{LoadBaseUrl}/{id}");
    }

    protected async Task<HttpResponseMessage> DeleteDraft(Guid id)
    {
        return await Client.DeleteAsync($"{LoadBaseUrl}/draft/{id}");
    }

    // --- Files ---
    protected async Task<HttpResponseMessage> UploadLoadFiles(Guid loadId, byte[] fileBytes, string fileName = "test.jpg")
    {
        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(fileBytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "files", fileName);
        return await Client.PutAsync($"{LoadBaseUrl}/{loadId}/files", content);
    }

    /// <summary>
    /// Возвращает список путей загруженных файлов груза, читая детали по JSON.
    /// Ищет свойства filePaths/files/FilePaths/Files/Documents/documentPaths.
    /// </summary>
    protected async Task<string[]> GetLoadFilePaths(Guid loadId, bool anonymous = false)
    {
        var client = anonymous ? _factory.CreateClient() : Client;
        var response = await client.GetAsync($"{LoadBaseUrl}/{loadId}");
        response.EnsureSuccessStatusCode();

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = doc.RootElement;

        foreach (var propName in new[] { "filePaths", "files", "FilePaths", "Files", "Documents", "documentPaths" })
        {
            if (root.TryGetProperty(propName, out var prop) && prop.ValueKind == JsonValueKind.Array)
            {
                return prop.EnumerateArray()
                    .Select(x => x.GetString())
                    .Where(s => !string.IsNullOrEmpty(s))
                    .ToArray()!;
            }
        }

        return Array.Empty<string>();
    }

    /// <summary>
    /// Возвращает часовой пояс и флаг метрической системы текущего авторизованного пользователя.
    /// Ожидает ответ от /api/User/me со свойствами time/timezone и isMetric/isMetricSystem.
    /// </summary>
    protected async Task<(int timezone, bool isMetric)> GetCurrentUserSettings()
    {
        var response = await Client.GetAsync("/api/User/me");
        response.EnsureSuccessStatusCode();

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = doc.RootElement;

        var timezone = 0;
        if (root.TryGetProperty("timeZone", out var tzProp)
            || root.TryGetProperty("timezone", out tzProp)
            || root.TryGetProperty("Timezone", out tzProp))
        {
            timezone = tzProp.GetInt32();
        }

        var isMetric = true;
        if (root.TryGetProperty("isMetric", out var metricProp)
            || root.TryGetProperty("isMetricSystem", out metricProp)
            || root.TryGetProperty("IsMetric", out metricProp))
        {
            isMetric = metricProp.GetBoolean();
        }

        return (timezone, isMetric);
    }

    // --- Test data helpers ---
    protected CreateLoadCommand CreateValidLoadCommand(
        string about = "Test load from integration test",
        string startCity = "Yekaterinburg",
        string endCity = "Moscow")
    {
        return new CreateLoadCommand
        {
            Payment = 5500,
            Insurance = 250,
            HScode = "8471.30",
            Adr = 2,
            VehicleTypes = new[] { "General", "Fragile" },
            CargoType = "Box",
            About = about,
            Distance = 1,
            Duration = "00:00:00",
            Payloads = new List<PayloadInputDto>
            {
                new()
                {
                    Length = 120,
                    Width = 80,
                    Height = 100,
                    Weight = 450,
                    Amount = 5,
                    Type = "Boxes"
                }
            },
            RoutePoints = new List<RoutePointInputDto>
            {
                new()
                {
                    City = startCity,
                    Address = "Склад 1, ул. Тестовая 10",
                    ArrivalTime = DateTime.UtcNow.AddDays(1)
                },
                new()
                {
                    City = endCity,
                    Address = "Терминал 2, пр. Ленина 5",
                    ArrivalTime = DateTime.UtcNow.AddDays(3)
                }
            }
        };
    }

    protected CreateLoadDraftCommand CreateValidDraftCommand(string about = "Test draft")
    {
        return new CreateLoadDraftCommand
        {
            Payment = 3200,
            Insurance = 150,
            HScode = "9403.20",
            Adr = 1,
            About = about,
            Payloads = new List<PayloadDraftInputDto>
            {
                new()
                {
                    Length = 100,
                    Width = 80,
                    Height = 50,
                    Weight = 200,
                    Amount = 2,
                    Type = "Boxes"
                }
            },
            RoutePoints = new List<RoutePointInputDto>
            {
                new()
                {
                    City = "Yekaterinburg",
                    Address = "Draft Start Address",
                    ArrivalTime = DateTime.UtcNow.AddDays(5)
                }
            }
        };
    }
}
