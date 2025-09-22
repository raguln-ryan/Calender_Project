using Backend.DataAccessLayer;
using Backend.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Backend.BusinessLayer
{
    public class UserBL : IUserBL
    {
        private readonly IUserDAL _userDAL;
        private readonly IConfiguration _config;

        public UserBL(IUserDAL userDAL, IConfiguration config)
        {
            _userDAL = userDAL;
            _config = config;
        }

        public async Task<User> RegisterAsync(string username, string password)
        {
            if (await _userDAL.GetUserByUsernameAsync(username) != null)
                throw new Exception("Username already exists");

            CreatePasswordHash(password, out byte[] passwordHash, out byte[] passwordSalt);

            var user = new User
            {
                Username = username,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt
            };

            await _userDAL.AddUserAsync(user);
            return user;
        }

        public async Task<string> LoginAsync(string username, string password)
        {
            var user = await _userDAL.GetUserByUsernameAsync(username);
            if (user == null || !VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
                throw new Exception("Invalid credentials");

            return GenerateJwtToken(user);
        }

        private void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
        {
            using var hmac = new HMACSHA512();
            salt = hmac.Key;
            hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }

        private bool VerifyPasswordHash(string password, byte[] hash, byte[] salt)
        {
            using var hmac = new HMACSHA512(salt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return computedHash.SequenceEqual(hash);
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["JwtSettings:Secret"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username)
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
