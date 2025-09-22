using Backend.BusinessLayer;
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

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null)
                throw new UnauthorizedAccessException("User ID claim not found in token.");
            return int.Parse(claim.Value);
        }


        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcomingAppointments()
        {
            var appointments = await _appointmentBL.GetAppointmentsByUserAsync(GetUserId());
            return Ok(appointments);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAppointment(Appointment appointment)
        {
            appointment.UserId = GetUserId();
            var created = await _appointmentBL.CreateAppointmentAsync(appointment);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, Appointment appointment)
        {
            appointment.Id = id;
            await _appointmentBL.UpdateAppointmentAsync(appointment, GetUserId());
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            await _appointmentBL.DeleteAppointmentAsync(id, GetUserId());
            return NoContent();
        }
    }
}
