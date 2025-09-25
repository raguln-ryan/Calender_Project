using Backend.BusinessLayer;
using Backend.DataAccessLayer;
using Backend.Models;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;

namespace Backend.Tests.BusinessLayer
{
    public class UserBLTests
    {
        private readonly Mock<IUserDAL> _mockUserDAL;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly UserBL _userBL;

        public UserBLTests()
        {
            _mockUserDAL = new Mock<IUserDAL>();
            _mockConfig = new Mock<IConfiguration>();
            // ✅ HS256 requires 32+ chars key
            _mockConfig.Setup(c => c["JwtSettings:Secret"])
                       .Returns("ThisIsASuperSecretKeyForJwt1234567890!");
            _userBL = new UserBL(_mockUserDAL.Object, _mockConfig.Object);
        }

        [Fact]
        public async Task RegisterAsync_ShouldRegisterNewUser_WhenUsernameDoesNotExist()
        {
            string username = "testuser";
            string password = "password123";

            _mockUserDAL.Setup(d => d.GetUserByUsernameAsync(username))
                        .ReturnsAsync((User)null);

            User? addedUser = null;
            _mockUserDAL.Setup(d => d.AddUserAsync(It.IsAny<User>()))
                        .Callback<User>(u => addedUser = u)
                        .Returns(Task.CompletedTask);

            var result = await _userBL.RegisterAsync(username, password);

            result.Should().NotBeNull();
            result.Username.Should().Be(username);
            result.PasswordHash.Should().NotBeNull();
            result.PasswordSalt.Should().NotBeNull();
            addedUser.Should().NotBeNull();
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnToken_WhenCredentialsAreValid()
        {
            string password = "password123";
            var user = new User { Id = 1, Username = "testuser" };

            // Manually generate password hash and salt
            using var hmac = new HMACSHA512();
            user.PasswordSalt = hmac.Key;
            user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

            _mockUserDAL.Setup(d => d.GetUserByUsernameAsync("testuser"))
                        .ReturnsAsync(user);

            var token = await _userBL.LoginAsync("testuser", password);

            token.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async Task LoginAsync_ShouldThrowException_WhenUserNotFound()
        {
            _mockUserDAL.Setup(d => d.GetUserByUsernameAsync("unknown"))
                        .ReturnsAsync((User)null);

            Func<Task> act = async () => await _userBL.LoginAsync("unknown", "password");

            await act.Should().ThrowAsync<Exception>()
                     .WithMessage("Invalid credentials");
        }

        [Fact]
        public async Task LoginAsync_ShouldThrowException_WhenPasswordIncorrect()
        {
            var user = new User { Id = 1, Username = "testuser" };

            // Correct hash/salt
            using var hmac = new HMACSHA512();
            user.PasswordSalt = hmac.Key;
            user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("correctpassword"));

            _mockUserDAL.Setup(d => d.GetUserByUsernameAsync("testuser"))
                        .ReturnsAsync(user);

            Func<Task> act = async () => await _userBL.LoginAsync("testuser", "wrongpassword");

            await act.Should().ThrowAsync<Exception>()
                     .WithMessage("Invalid credentials");
        }

        [Fact]
        public async Task ValidateUserAsync_ShouldCallDAL()
        {
            var user = new User { Id = 1, Username = "testuser" };
            _mockUserDAL.Setup(d => d.ValidateUserAsync("testuser", "password"))
                        .ReturnsAsync(user);

            var result = await _userBL.ValidateUserAsync("testuser", "password");

            result.Should().Be(user);
        }

        [Fact]
        public async Task GetUserByUsernameAsync_ShouldCallDAL()
        {
            var user = new User { Id = 1, Username = "testuser" };
            _mockUserDAL.Setup(d => d.GetUserByUsernameAsync("testuser"))
                        .ReturnsAsync(user);

            var result = await _userBL.GetUserByUsernameAsync("testuser");

            result.Should().Be(user);
        }
    }
}
