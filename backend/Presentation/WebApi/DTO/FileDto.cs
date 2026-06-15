namespace WebApi.DTO;

public record FileDto
{
    public required IFormFile File { get; set; }
}
