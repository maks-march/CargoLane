using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Application.CQRS.LoadCQ.Commands.CreateLoad;
using Application.CQRS.LoadCQ.Commands.Draft.Create;
using Application.DTO.Auth;
using Application.DTO.Load;

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


    // --- Public list (GET /api/Load) ---
    protected async Task<LoadListVm[]> GetAllLoads(bool anonymous = false, string status = "Active")
    {
        var client = anonymous ? Factory.CreateClient() : Client;
        var query = string.IsNullOrEmpty(status) ? "" : $"?status={status}";
        var response = await client.GetAsync(LoadBaseUrl + query);
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
    protected async Task<LoadListVm[]> GetMyLoads(string status = "Active")
    {
        var response = await Client.GetAsync($"{LoadBaseUrl}/me?status={status}");
        return await ExtractFromResponse<LoadListVm[]>(response) ?? Array.Empty<LoadListVm>();
    }

    // --- Details (public) ---
    protected async Task<LoadDetailsVm> GetLoadDetails(Guid id, bool anonymous = false)
    {
        var client = anonymous ? Factory.CreateClient() : Client;
        var response = await client.GetAsync($"{LoadBaseUrl}/{id}");
        return await ExtractFromResponse<LoadDetailsVm>(response) ?? new();
    }

    // --- Drafts ---
    protected async Task<LoadDraftVm> GetDraft(Guid id)
    {
        var response = await Client.GetAsync($"{LoadBaseUrl}/draft/{id}");
        return await ExtractFromResponse<LoadDraftVm>(response) ?? new();
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
        var client = anonymous ? Factory.CreateClient() : Client;
        var response = await client.GetAsync($"{LoadBaseUrl}/{loadId}");
        response.EnsureSuccessStatusCode();

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = doc.RootElement;

        foreach (var propName in new[] { "filePaths", "files", "FilePaths", "Files", "Documents", "documentPaths" })
        {
            if (root.TryGetProperty(propName, out var prop) && prop.ValueKind == JsonValueKind.Array)
            {
                return prop.EnumerateArray()
                    .Select(x => x.GetString() ?? "")
                    .Where(s => !string.IsNullOrEmpty(s))
                    .ToArray();
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
    
    // --- Save / Unsave helpers ---
    protected async Task<bool> SaveLoad(Guid loadId)
    {
        var response = await Client.PostAsync($"{LoadBaseUrl}/{loadId}/save", null);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<bool>();
    }

    protected async Task<LoadListVm[]> GetMySavedLoads()
    {
        var response = await Client.GetAsync($"{LoadBaseUrl}/user/saved");
        return await ExtractFromResponse<LoadListVm[]>(response) ?? Array.Empty<LoadListVm>();
    }

    protected CreateLoadCommand CreateValidLoadCommandWithPayment(string about, double payment)
    {
        var cmd = CreateValidLoadCommand(about);
        cmd.Payment = payment;
        return cmd;
    }

    // Enhanced filter helper supporting more params
    protected async Task<LoadListVm[]> GetAllLoadsWithFullFilter(
        string? searchBy = null,
        string? startCity = null,
        string? endCity = null,
        string? status = null,
        string? sortBy = null,
        bool isDescending = false)
    {
        var queryParams = new List<string>();
        if (!string.IsNullOrEmpty(searchBy)) queryParams.Add($"searchBy={Uri.EscapeDataString(searchBy)}");
        if (!string.IsNullOrEmpty(startCity)) queryParams.Add($"StartCity={Uri.EscapeDataString(startCity)}");
        if (!string.IsNullOrEmpty(endCity)) queryParams.Add($"EndCity={Uri.EscapeDataString(endCity)}");
        if (!string.IsNullOrEmpty(status)) queryParams.Add($"Status={status}");
        if (!string.IsNullOrEmpty(sortBy)) queryParams.Add($"SortBy={sortBy}");
        if (isDescending) queryParams.Add("IsDescending=true");

        var query = queryParams.Any() ? "?" + string.Join("&", queryParams) : "";
        var response = await Client.GetAsync($"{LoadBaseUrl}{query}");
        return await ExtractFromResponse<LoadListVm[]>(response) ?? Array.Empty<LoadListVm>();
    }

    // ============================================
    // Admin moderation helpers
    // ============================================

    /// <summary>
    /// Создаёт груз и сразу аппрувит его через админа.
    /// Сохраняет и восстанавливает текущий auth-контекст вызывающего.
    /// </summary>
    protected async Task<Guid> CreateLoadAndApprove(CreateLoadCommand command)
    {
        var id = await CreateLoad(command);
        await ApproveLoad(id);
        return id;
    }

    /// <summary>
    /// Аппрувит груз от имени админа, затем восстанавливает auth на того пользователя,
    /// который был авторизован ДО вызова (а не на дефолтный Tokens).
    /// </summary>
    protected async Task ApproveLoad(Guid loadId)
    {
        // Запоминаем текущий auth header, чтобы восстановить после
        var previousAuth = Client.DefaultRequestHeaders.Authorization;
        
        SetAuth(AdminTokens);
        var response = await Client.PostAsync($"/api/LoadAdmin/{loadId}/approve", null);
        response.EnsureSuccessStatusCode();
        
        // Восстанавливаем предыдущий auth
        Client.DefaultRequestHeaders.Authorization = previousAuth;
    }

    /// <summary>
    /// Реджектит груз от имени админа, затем восстанавливает auth на предыдущего пользователя.
    /// </summary>
    protected async Task RejectLoad(Guid loadId, string reason = "test reject")
    {
        var previousAuth = Client.DefaultRequestHeaders.Authorization;
        
        SetAuth(AdminTokens);
        var response = await Client.PostAsJsonAsync($"/api/LoadAdmin/{loadId}/reject", reason);
        response.EnsureSuccessStatusCode();
        
        Client.DefaultRequestHeaders.Authorization = previousAuth;
    }

    protected async Task<LoadListVm[]> GetAdminReviews()
    {
        var previousAuth = Client.DefaultRequestHeaders.Authorization;
        
        SetAuth(AdminTokens);
        var resp = await Client.GetAsync("/api/LoadAdmin/reviews");
        var result = await ExtractFromResponse<LoadListVm[]>(resp) ?? Array.Empty<LoadListVm>();
        
        Client.DefaultRequestHeaders.Authorization = previousAuth;
        return result;
    }

    // ============================================
    // Book / Unbook / Close helpers
    // ============================================

    /// <summary>
    /// Бронирует груз от имени текущего пользователя. Возвращает ID созданного чата.
    /// </summary>
    protected async Task<HttpResponseMessage> BookLoad(Guid loadId)
    {
        return await Client.PostAsync($"{LoadBaseUrl}/{loadId}/book", null);
    }

    /// <summary>
    /// Разбронирует груз от имени текущего пользователя.
    /// </summary>
    protected async Task<HttpResponseMessage> UnbookLoad(Guid loadId)
    {
        return await Client.PostAsync($"{LoadBaseUrl}/{loadId}/unbook", null);
    }

    /// <summary>
    /// Закрывает груз (необратимая операция). Доступно только владельцу.
    /// </summary>
    protected async Task<HttpResponseMessage> CloseLoad(Guid loadId)
    {
        return await Client.PostAsync($"{LoadBaseUrl}/{loadId}/close", null);
    }

    protected async Task<LoadDetailsVm> GetAdminReview(Guid id)
    {
        var previousAuth = Client.DefaultRequestHeaders.Authorization;
        
        SetAuth(AdminTokens);
        var resp = await Client.GetAsync($"/api/LoadAdmin/{id}/review");
        var result = await ExtractFromResponse<LoadDetailsVm>(resp) ?? new();
        
        Client.DefaultRequestHeaders.Authorization = previousAuth;
        return result;
    }
}
