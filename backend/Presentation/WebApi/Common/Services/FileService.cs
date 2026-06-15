using Application.Interfaces;

namespace WebApi.Common.Services;

internal class FileService(IWebHostEnvironment enviroment) : IFileService
{
    public async Task<string[]> SaveFiles(CancellationToken cancellationToken, params IFormFile[] files)
    {
        if (files.Length == 0)
            return [];
        var paths = new List<string>();
        foreach (var file in files)
        {
            // Генерируем уникальное имя файла, чтобы избежать конфликтов
            var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(enviroment.WebRootPath + "/uploads/", uniqueFileName);

            // Асинхронно копируем содержимое файла из временного хранилища в наш файл
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }
            // Сохраняем относительный URL файла, чтобы потом его можно было отобразить
            // Например: "/uploads/orders/guid_имяфайла.jpg"
            paths.Add(filePath.Replace('\\', '/'));
        }
        return paths.ToArray();
    }

    public Task<bool> DeleteFiles(CancellationToken cancellationToken, params string[] paths)
    {
        bool allDeleted = true;
        foreach (var relativePath in paths)
        {
            if (string.IsNullOrWhiteSpace(relativePath)) continue;

            // Склеиваем wwwroot + относительный путь из базы
            var fullPath = relativePath;
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
            else
            {
                Console.WriteLine("Files not found");
            }
        }
        return Task.FromResult(allDeleted);
    }
}