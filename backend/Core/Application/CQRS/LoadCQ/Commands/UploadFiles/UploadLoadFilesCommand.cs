using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.CQRS.LoadCQ.Commands.UploadFiles;

public record UploadLoadFilesCommand : IRequest<string[]>
{
    public Guid LoadId { get; set; }
    public Guid UserId { get; set; }
    public IFormFile[] Files { get; set; } = [];
}