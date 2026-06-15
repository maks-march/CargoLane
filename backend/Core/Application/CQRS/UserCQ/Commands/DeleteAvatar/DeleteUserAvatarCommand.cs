using MediatR;

namespace Application.CQRS.UserCQ.Commands.DeleteAvatar;

public record DeleteUserAvatarCommand(Guid UserId) : IRequest;