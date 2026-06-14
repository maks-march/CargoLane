using Application.CQRS.AuthCQ.Register;
using Application.DTO.Auth;
using Application.Interfaces.Auth;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.CQRS.AuthCQ.Google;

public class GoogleAuthCommandHandler(
    // IIdentityService identityService,
    // IJwtProvider tokenService, // Твой сервис генерации JWT
    // IEmailService emailService,
    IGoogleAuthProvider googleAuthProvider,
    UserManager<ApplicationUser> userManager) : IRequestHandler<GoogleAuthCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(GoogleAuthCommand request, CancellationToken ct)
    {
        // 1. Валидация токена через Google API
        var email = await googleAuthProvider.ValidateSignature(request.IdToken);

        // 2. Ищем системного юзера по Email
        var appUser = await userManager.FindByEmailAsync(email);
        
        return new AuthResponse("", "", Guid.Empty, null);
    }
}