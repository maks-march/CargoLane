namespace Application.DTO.Auth;

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    Guid UserId,
    string? UserName
);