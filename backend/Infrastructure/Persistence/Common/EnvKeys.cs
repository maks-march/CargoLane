namespace Persistence.Common;

public static class EnvKeys
{
    public const string Production = "Production";
    public const string Development = "Development";
    public const string Testing = "Testing";
    
    public const string EnvironmentType = "Environment:Type";
    public const string EnvironmentPath = "Environment:Path";
    public const string DefaultConnection = "DefaultConnection";
    
    public const string Issuer = "Jwt:Issuer";
    public const string Audience = "Jwt:Audience";
    public const string Secret = "Jwt:SecretKey";
    public const string ExpirationTime = "Jwt:ExpiryMinutes";
}