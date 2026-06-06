using Application.DTO.Order;
using FluentAssertions;

namespace ApplicationTest.IntegrationTests.Order;

[TestFixture]
public class OrderFilesTests : OrderTestBase
{
    [Test]
    public async Task PutNewPhotos()
    {
        var id = await PostValidOrder();
        var fileNames = new[] {"photo1.jpg", "photo2.png"};
        var response = await PutPhotos(id, fileNames);

        response.IsSuccessStatusCode.Should().BeTrue();
        
        var getResponse = await Client.GetAsync($"{BaseUrl}/{id}");
        var order = await ExtractFromResponse<OrderDetailsVm>(getResponse);
        
        order.Should().NotBeNull();
        order.Photos.Should().HaveCount(2);
        order.Photos
            .Zip(fileNames, 
                (orderPhoto, fileName) => orderPhoto.Contains(fileName))
            .All(x => x)
            .Should().BeTrue();
        
        await FileService.DeleteFiles(CancellationToken.None, order.Photos);
    }
    
    [Test]
    public async Task UpdatePhotos()
    {
        var id = await PostValidOrder();
        var fileNames = new[] {"photo1.jpg", "photo2.png"};
        var response = await PutPhotos(id, fileNames);

        response.IsSuccessStatusCode.Should().BeTrue();
        var secondFileNames = new[] {"photo1.2.jpg", "photo2.2.png"};
        var secondResponse = await PutPhotos(id, secondFileNames);
        secondResponse.IsSuccessStatusCode.Should().BeTrue();
        
        var getResponse = await Client.GetAsync($"{BaseUrl}/{id}");
        var order = await ExtractFromResponse<OrderDetailsVm>(getResponse);
        
        order.Should().NotBeNull();
        order.Photos.Should().HaveCount(2);
        order.Photos
            .Zip(secondFileNames,
                (orderPhoto, fileName) => orderPhoto.Contains(fileName))
            .All(x => x)
            .Should().BeTrue();
        
        await FileService.DeleteFiles(CancellationToken.None, order.Photos);
    }

    [Test]
    public async Task ClearPhotos()
    {
        var id = await PostValidOrder();
        var fileNames = new[] {"photo1.jpg", "photo2.png"};
        var response = await PutPhotos(id, fileNames);

        response.IsSuccessStatusCode.Should().BeTrue();
        var secondFileNames = Array.Empty<string>();
        var secondResponse = await PutPhotos(id, secondFileNames);
        secondResponse.IsSuccessStatusCode.Should().BeTrue();
        var getResponse = await Client.GetAsync($"{BaseUrl}/{id}");
        var order = await ExtractFromResponse<OrderDetailsVm>(getResponse);
        
        order.Should().NotBeNull();
        order.Photos.Should().HaveCount(0);
    }
    
    private async Task<HttpResponseMessage> PutPhotos(Guid id, params string[] fileNames)
    {
        if (fileNames.Length == 0)
            return await Client.PutAsync($"{BaseUrl}/{id}/photos", null);
        using var content = new MultipartFormDataContent();
        foreach (var fileName in fileNames)
        {
            var fileContent = new ByteArrayContent(new byte[] { 0x1, 0x2, 0x3, 0x4 });
            fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
            // Важно: "Photos" — это имя свойства в вашем PhotoDto (или имя параметра в контроллере)
            content.Add(fileContent, "Photos", fileName);
        }
        return await Client.PutAsync($"{BaseUrl}/{id}/photos", content);
    }
}