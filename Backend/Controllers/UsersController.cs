using Backend.BusinessLayer;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IJwtService _jwtService;
        private readonly IUserBL _userBL;

        public UsersController(IUserBL userBL, IJwtService jwtService)
        {
            _userBL = userBL;
            _jwtService = jwtService;
        }

        // -------------------------
        // Register a new user
        // -------------------------
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto dto)
        {
            // Check if username already exists
            var existingUser = await _userBL.ValidateUserAsync(dto.Username, dto.Password);
            if (existingUser != null)
                return BadRequest(new { Message = "Username already exists" });

            // Register user
            var user = await _userBL.RegisterAsync(dto.Username, dto.Password);

            return Ok(new { user.Id, user.Username });
        }

        // -------------------------
        // Login user and generate JWT
        // -------------------------
        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto dto)
        {
            // Validate username and password
            var user = await _userBL.ValidateUserAsync(dto.Username, dto.Password);
            if (user == null)
                return Unauthorized(new { Message = "Invalid username or password" });

            // Generate JWT
            var token = _jwtService.GenerateToken(user.Id.ToString(), user.Username);

            return Ok(new { Token = token });
        }
    }
}
