using Backend.Data;
using Backend.DataAccessLayer;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Backend.Tests.DataAccessLayer
{
    public class UserDALTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        private User CreateUser(string username, string password)
        {
            using var hmac = new HMACSHA512();
            return new User
            {
                Username = username,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password)),
                PasswordSalt = hmac.Key
            };
        }

        [Fact]
        public async Task AddUserAsync_ShouldAddUser()
        {
            using var context = GetDbContext();
            var dal = new UserDAL(context);

            var user = CreateUser("testuser", "password123");
            await dal.AddUserAsync(user);

            Assert.Single(context.Users);
            Assert.Equal("testuser", (await context.Users.FirstAsync()).Username);
        }

        [Fact]
        public async Task GetUserByUsernameAsync_ShouldReturnUser()
        {
            using var context = GetDbContext();
            var user = CreateUser("john", "pass");
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var dal = new UserDAL(context);
            var result = await dal.GetUserByUsernameAsync("john");

            Assert.NotNull(result);
            Assert.Equal("john", result.Username);
        }

        [Fact]
        public async Task GetUserByUsernameAsync_ShouldReturnNull_WhenUserNotFound()
        {
            using var context = GetDbContext();
            var dal = new UserDAL(context);

            var result = await dal.GetUserByUsernameAsync("ghost");

            Assert.Null(result);
        }

        [Fact]
        public async Task ValidateUserAsync_ShouldReturnUser_WhenPasswordMatches()
        {
            using var context = GetDbContext();
            var user = CreateUser("alice", "mypassword");
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var dal = new UserDAL(context);
            var result = await dal.ValidateUserAsync("alice", "mypassword");

            Assert.NotNull(result);
            Assert.Equal("alice", result.Username);
        }

        [Fact]
        public async Task ValidateUserAsync_ShouldReturnNull_WhenPasswordDoesNotMatch()
        {
            using var context = GetDbContext();
            var user = CreateUser("bob", "secret");
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var dal = new UserDAL(context);
            var result = await dal.ValidateUserAsync("bob", "wrong");

            Assert.Null(result);
        }

        [Fact]
        public async Task ValidateUserAsync_ShouldReturnNull_WhenUserNotFound()
        {
            using var context = GetDbContext();
            var dal = new UserDAL(context);

            var result = await dal.ValidateUserAsync("nouser", "any");

            Assert.Null(result);
        }

        [Fact]
        public async Task ValidateUserAsync_ShouldWorkWithDifferentSalts()
        {
            using var context = GetDbContext();
            var user1 = CreateUser("sam", "hello123");
            var user2 = CreateUser("sam2", "hello123"); // same password, different salt
            context.Users.AddRange(user1, user2);
            await context.SaveChangesAsync();

            var dal = new UserDAL(context);
            var result1 = await dal.ValidateUserAsync("sam", "hello123");
            var result2 = await dal.ValidateUserAsync("sam2", "hello123");

            Assert.NotNull(result1);
            Assert.NotNull(result2);
            Assert.NotEqual(Convert.ToBase64String(user1.PasswordSalt), Convert.ToBase64String(user2.PasswordSalt));
        }

        [Fact]
        public async Task ValidateUserAsync_ShouldFail_WhenPasswordHashTampered()
        {
            using var context = GetDbContext();
            var user = CreateUser("jack", "original");
            // corrupt the hash
            user.PasswordHash[0] ^= 0xFF;
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var dal = new UserDAL(context);
            var result = await dal.ValidateUserAsync("jack", "original");

            Assert.Null(result);
        }
    }
}
