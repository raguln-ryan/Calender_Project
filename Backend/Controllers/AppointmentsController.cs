using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _service;

        public AppointmentsController(IAppointmentService service)
        {
            _service = service;
        }

        // GET /api/appointments?date=2025-09-15
        [HttpGet]
        public async Task<IActionResult> GetAppointments([FromQuery] DateTime date)
        {
            var appointments = await _service.GetAppointmentsByDateAsync(date);
            return Ok(appointments);
        }

        // POST /api/appointments
        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromBody] Appointment dto)
        {
            try
            {
                var created = await _service.CreateAppointmentAsync(dto);
                return CreatedAtAction(nameof(GetAppointments), new { date = dto.StartTime.Date }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // PUT /api/appointments/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] Appointment dto)
        {
            try
            {
                var updated = await _service.UpdateAppointmentAsync(id, dto);
                return Ok(updated);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Appointment not found." });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // DELETE /api/appointments/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var success = await _service.DeleteAppointmentAsync(id);
            if (!success) return NotFound();

            return NoContent();
        }

        // GET /api/appointments/upcoming?start=2025-09-16&end=2025-09-19
        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcomingAppointments([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            var appointments = await _service.GetUpcomingAppointmentsAsync(start, end);
            return Ok(appointments);
        }
    }
}
