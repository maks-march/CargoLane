using Application.DTO.Auth;
using MediatR;

namespace Application.CQRS.AuthCQ.Google;

public record GoogleAuthCommand(string IdToken) : IRequest<AuthResponse>;