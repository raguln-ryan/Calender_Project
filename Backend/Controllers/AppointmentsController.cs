using Backend.BusinessLayer;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentBL _appointmentBL;

        public AppointmentsController(IAppointmentBL appointmentBL)
        {
            _appointmentBL = appointmentBL;
        }

        // Helper: get user ID from JWT token
        private async Task<int> GetUserIdAsync()
        {
            var userClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userClaim))
                throw new Exception("User ID claim is missing.");

            if (int.TryParse(userClaim, out int userId))
                return userId;

            var user = await _appointmentBL.GetUserByUsernameAsync(userClaim);
            if (user == null)
                throw new Exception("User not found.");

            return user.Id;
        }

        // GET: api/appointments/upcoming
        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcomingAppointments()
        {
            var userId = await GetUserIdAsync();
            var appointments = await _appointmentBL.GetAppointmentsByUserAsync(userId);
            return Ok(appointments);
        }

        // POST: api/appointments
        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = await GetUserIdAsync();
            try
            {
                var created = await _appointmentBL.CreateAppointmentAsync(dto, userId);
                return CreatedAtAction(nameof(GetUpcomingAppointments), new { id = created.Id }, created);
            }
            catch (System.Exception ex)
            {
                if (ex.Message.Contains("conflict"))
                    return Conflict(new { message = ex.Message });
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/appointments/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] UpdateAppointmentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = await GetUserIdAsync();
             try
            {
                var updated = await _appointmentBL.UpdateAppointmentAsync(id, dto, userId);
                if (!updated)
                    return NotFound();
                return NoContent();
            }
            catch (System.Exception ex)
            {
                if (ex.Message.Contains("conflict"))
                    return Conflict(new { message = ex.Message });
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/appointments/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var userId = await GetUserIdAsync();
            var deleted = await _appointmentBL.DeleteAppointmentAsync(id, userId);

            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}
