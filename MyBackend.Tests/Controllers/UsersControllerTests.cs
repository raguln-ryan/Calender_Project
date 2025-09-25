using Backend.BusinessLayer;
using Backend.Controllers;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Threading.Tasks;
using Xunit;

namespace Backend.Tests.Controllers
{
    public class UsersControllerTests
    {
        private readonly Mock<IUserBL> _mockUserBL;
        private readonly Mock<IJwtService> _mockJwtService;
        private readonly UsersController _controller;

        public UsersControllerTests()
        {
            _mockUserBL = new Mock<IUserBL>();
            _mockJwtService = new Mock<IJwtService>();
            
            // Setup JWT service to return a dummy token
            _mockJwtService.Setup(x => x.GenerateToken(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
                           .Returns("dummy_token");
            
            _controller = new UsersController(_mockUserBL.Object, _mockJwtService.Object);
        }

        [Fact]
        public async Task Register_ReturnsOk_WhenUserIsCreated()
        {
            _mockUserBL.Setup(x => x.ValidateUserAsync(It.IsAny<string>(), It.IsAny<string>()))
                       .ReturnsAsync((User?)null);

            _mockUserBL.Setup(x => x.RegisterAsync(It.IsAny<string>(), It.IsAny<string>()))
                       .ReturnsAsync(new User { Id = 1, Username = "testuser" });

            var result = await _controller.Register(new UserRegisterDto());

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task Login_ReturnsOk_WhenValidUser()
        {
            _mockUserBL.Setup(x => x.ValidateUserAsync(It.IsAny<string>(), It.IsAny<string>()))
                       .ReturnsAsync(new User { Id = 1, Username = "testuser" });

            var result = await _controller.Login(new UserLoginDto());

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenUsernameExists()
        {
            _mockUserBL.Setup(x => x.ValidateUserAsync(It.IsAny<string>(), It.IsAny<string>()))
                       .ReturnsAsync(new User { Id = 1, Username = "existinguser" });

            var result = await _controller.Register(new UserRegisterDto());

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenInvalidUser()
        {
            _mockUserBL.Setup(x => x.ValidateUserAsync(It.IsAny<string>(), It.IsAny<string>()))
                       .ReturnsAsync((User?)null);

            var result = await _controller.Login(new UserLoginDto());

            Assert.IsType<UnauthorizedObjectResult>(result);
        }
    }
}
