using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.CQRS.UserCQ.Commands.UploadAvatar;

public record UploadUserAvatarCommand : IRequest<string>
{
    public Guid UserId { get; init; }
    public required IFormFile Avatar { get; init; }
}