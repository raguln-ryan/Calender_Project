
using Microsoft.AspNetCore.Mvc;      // ✅ Needed for [ApiController], [HttpGet], [HttpPost], [HttpDelete], [FromBody]
using Microsoft.EntityFrameworkCore; // ✅ Needed for EF Core (DbContext, LINQ async ops)
using backend.Data;                  // ✅ Your DbContext
using backend.Models;                // ✅ Your Appointment model


namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AppointmentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/appointments?date=2025-09-10
        [HttpGet]
        public async Task<IActionResult> GetAppointments([FromQuery] DateTime date)
        {
            var appointments = await _context.Appointments
                .Where(a => a.StartTime.Date == date.Date)
                .OrderBy(a => a.StartTime)
                .ToListAsync();

            return Ok(appointments);
        }

        // POST /api/appointments
        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromBody] Appointment dto)
        {
            var conflict = await _context.Appointments.AnyAsync(a =>
                dto.StartTime < a.EndTime && dto.EndTime > a.StartTime);

            if (conflict)
                return Conflict(new { message = "Appointment conflict detected!" });

            _context.Appointments.Add(dto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAppointments), new { date = dto.StartTime.Date }, dto);
        }

        // DELETE /api/appointments/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return NotFound();

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
