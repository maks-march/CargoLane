using Microsoft.AspNetCore.Http;

namespace WebApi.DTO;

public record PhotoDto
{
    public required IFormFile Photo { get; set; }
}
