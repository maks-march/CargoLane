using Application.DTO.Truck;
using FluentAssertions;

namespace ApplicationTest.IntegrationTests.Truck;

[TestFixture]
public class TruckFilesTests : TruckTestBase
{
    [Test]
    public async Task PutNewPhotos_SavesFilesCorrectly()
    {
        // Arrange
        var id = await CreateTestTruck();
        var fileNames = new[] { "truck_front.jpg", "truck_side.png" };

        // Act
        var response = await PutPhotos(id, fileNames);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var getResponse = await Client.GetAsync($"{BaseUrl}/{id}");
        var truck = await ExtractFromResponse<TruckDetailsVm>(getResponse);
        
        truck.Should().NotBeNull();
        truck!.Photos.Should().HaveCount(2);
        
        // Проверяем, что имена файлов содержатся в путях (ссылках)
        truck.Photos
            .Zip(fileNames, (photoPath, fileName) => photoPath.Contains(fileName))
            .All(x => x)
            .Should().BeTrue();
        
        // Очистка физических файлов через FileService (доступен из BaseIntegrationTest)
        await FileService.DeleteFiles(CancellationToken.None, truck.Photos);
    }
    
    [Test]
    public async Task UpdatePhotos_ReplacesOldPhotosWithNewOnes()
    {
        // Arrange
        var id = await CreateTestTruck();
        
        // Первая загрузка
        var firstFiles = new[] { "old_photo.jpg" };
        await PutPhotos(id, firstFiles);

        // Вторая загрузка (обновление)
        var secondFiles = new[] { "new_photo1.jpg", "new_photo2.png" };
        var response = await PutPhotos(id, secondFiles);
        response.IsSuccessStatusCode.Should().BeTrue();
        
        // Act
        var getResponse = await Client.GetAsync($"{BaseUrl}/{id}");
        var truck = await ExtractFromResponse<TruckDetailsVm>(getResponse);
        
        // Assert
        truck.Should().NotBeNull();
        truck!.Photos.Should().HaveCount(2);
        truck.Photos.Any(p => p.Contains("old_photo.jpg")).Should().BeFalse();
        truck.Photos.All(p => secondFiles.Any(sf => p.Contains(sf))).Should().BeTrue();
        
        await FileService.DeleteFiles(CancellationToken.None, truck.Photos);
    }

    [Test]
    public async Task ClearPhotos_RemovesAllPhotosFromTruck()
    {
        // Arrange
        var id = await CreateTestTruck();
        await PutPhotos(id, "to_be_deleted.jpg");

        // Act: Отправляем пустой список
        var response = await PutPhotos(id, Array.Empty<string>());
        response.IsSuccessStatusCode.Should().BeTrue();

        var getResponse = await Client.GetAsync($"{BaseUrl}/{id}");
        var truck = await ExtractFromResponse<TruckDetailsVm>(getResponse);
        
        // Assert
        truck.Should().NotBeNull();
        truck!.Photos.Should().HaveCount(0);
    }
    
    /// <summary>
    /// Вспомогательный метод для отправки Multipart запроса с файлами
    /// </summary>
    private async Task<HttpResponseMessage> PutPhotos(Guid id, params string[] fileNames)
    {
        if (fileNames.Length == 0)
        {
            // Если файлов нет, отправляем пустой запрос (имитация очистки коллекции)
            return await Client.PutAsync($"{BaseUrl}/{id}/photos", null);
        }

        using var content = new MultipartFormDataContent();
        foreach (var fileName in fileNames)
        {
            // Генерируем фейковый контент файла
            var fileContent = new ByteArrayContent(new byte[] { 0x1, 0x2, 0x3, 0x4 });
            fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
            
            // "Photos" — имя поля, которое ожидает PhotoDto/Контроллер
            content.Add(fileContent, "Photos", fileName);
        }

        return await Client.PutAsync($"{BaseUrl}/{id}/photos", content);
    }
}