namespace Backend.BusinessLayer
{
    public interface IJwtService
    {
        string GenerateToken(string userId, string userEmail, int expiresInHours = 1);
    }
}
