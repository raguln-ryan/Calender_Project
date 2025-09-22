using Backend.BusinessLayer;
using Backend.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserBL _userBL;

        public UsersController(IUserBL userBL)
        {
            _userBL = userBL;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto dto)
        {
            var user = await _userBL.RegisterAsync(dto.Username, dto.Password);
            return Ok(new { user.Id, user.Username });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto dto)
        {
            var token = await _userBL.LoginAsync(dto.Username, dto.Password);
            return Ok(new { Token = token });
        }
    }
}
