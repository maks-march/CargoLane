using Application.Interfaces.Auth;
using Google.Apis.Auth;

namespace Persistence.Common.Auth;

public class GoogleAuthProvider : IGoogleAuthProvider
{
    public async Task<string> ValidateSignature(string idToken)
    {
        var payload = await GoogleJsonWebSignature.ValidateAsync(idToken);
        return payload.Email;
    }
}