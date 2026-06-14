using Microsoft.AspNetCore.Http;

namespace WebApi.DTO;

public class PhotoDto
{
    public IFormFile? Avatar { get; set; }
    public IFormFile[]? Photos { get; set; }
}
