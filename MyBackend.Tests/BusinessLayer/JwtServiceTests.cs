using Backend.BusinessLayer;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using Xunit;

namespace Backend.Tests.BusinessLayer
{
    public class JwtServiceTests
    {
        private JwtService CreateService(Dictionary<string, string>? configValues = null)
        {
            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(configValues ?? new Dictionary<string, string>())
                .Build();

            return new JwtService(configuration);
        }

        [Fact]
        public void GenerateToken_ShouldReturn_NonEmptyString()
        {
            // Arrange
            var service = CreateService();
            var userId = "123";
            var userEmail = "test@example.com";

            // Act
            var token = service.GenerateToken(userId, userEmail);

            // Assert
            Assert.False(string.IsNullOrWhiteSpace(token));
        }

        [Fact]
        public void GenerateToken_ShouldContainExpectedClaims()
        {
            // Arrange
            var service = CreateService();
            var userId = "123";
            var userEmail = "test@example.com";

            // Act
            var token = service.GenerateToken(userId, userEmail);
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);

            // Assert
            Assert.Contains(jwt.Claims, c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == userEmail);
            Assert.Contains(jwt.Claims, c => c.Type == "nameid" && c.Value == userId);
            Assert.Contains(jwt.Claims, c => c.Type == JwtRegisteredClaimNames.Jti);
        }

        [Fact]
        public void GenerateToken_ShouldRespectExpiryTime()
        {
            // Arrange
            var service = CreateService();
            var userId = "123";
            var userEmail = "test@example.com";

            // Act
            var token = service.GenerateToken(userId, userEmail, expiresInHours: 2);
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);

            // Assert
            Assert.NotNull(jwt.ValidTo);
            Assert.True(jwt.ValidTo > DateTime.UtcNow.AddMinutes(100)); // near 2 hours
            Assert.True(jwt.ValidTo <= DateTime.UtcNow.AddHours(2).AddMinutes(1));
        }

        [Fact]
        public void GenerateToken_ShouldUseCustomIssuerAndAudience()
        {
            // Arrange
            var configValues = new Dictionary<string, string>
            {
                { "JwtSettings:Secret", "supersecretkey1234567890" },
                { "JwtSettings:Issuer", "TestIssuer" },
                { "JwtSettings:Audience", "TestAudience" }
            };
            var service = CreateService(configValues);
            var userId = "123";
            var userEmail = "test@example.com";

            // Act
            var token = service.GenerateToken(userId, userEmail);
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);

            // Assert
            Assert.Equal("TestIssuer", jwt.Issuer);
            Assert.Equal("TestAudience", jwt.Audiences.First());
        }
    }
}
