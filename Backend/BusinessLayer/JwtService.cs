using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.BusinessLayer
{
    public class JwtService : IJwtService
    {
        private readonly string _secret;
        private readonly string _issuer;
        private readonly string _audience;

        public JwtService(IConfiguration config)
        {
            var jwtSettings = config.GetSection("JwtSettings");
            _secret = jwtSettings["Secret"] ?? "ThisIsASecretKeyForJwt";
            _issuer = jwtSettings["Issuer"] ?? "MyApp";
            _audience = jwtSettings["Audience"] ?? _issuer; // fallback to issuer if audience not set
        }

        /// <summary>
        /// Generates a JWT token for the given user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="userEmail">User email / username</param>
        /// <param name="expiresInHours">Token expiry in hours (default 1 hour)</param>
        /// <returns>JWT token string</returns>
        public string GenerateToken(string userId, string userEmail, int expiresInHours = 1)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userEmail),
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expiresInHours),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
