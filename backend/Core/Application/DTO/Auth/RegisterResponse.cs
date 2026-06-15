namespace Application.DTO.Auth;

public record RegisterResponse(bool Succeeded, Guid Id, string Token)
{
    
}