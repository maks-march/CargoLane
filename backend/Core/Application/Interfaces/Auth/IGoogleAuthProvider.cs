namespace Application.Interfaces.Auth;

public interface IGoogleAuthProvider
{
    public Task<string> ValidateSignature(string idToken);
}