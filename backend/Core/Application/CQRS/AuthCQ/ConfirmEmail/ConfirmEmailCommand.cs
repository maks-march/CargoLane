using MediatR;

namespace Application.CQRS.AuthCQ.ConfirmEmail;

public record ConfirmEmailCommand(Guid UserId, string Token) : IRequest<(bool Succeeded, string[] Errors)>;