using Backend.DataAccessLayer;
using Backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.BusinessLayer
{
    public class AppointmentBL : IAppointmentBL
    {
        private readonly IAppointmentDAL _appointmentDAL;

        public AppointmentBL(IAppointmentDAL appointmentDAL)
        {
            _appointmentDAL = appointmentDAL;
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsByUserAsync(int userId)
        {
            return await _appointmentDAL.GetAppointmentsByUserAsync(userId);
        }

        public async Task<Appointment> GetAppointmentByIdAsync(int id, int userId)
        {
            var appointment = await _appointmentDAL.GetAppointmentByIdAsync(id);
            if (appointment == null || appointment.UserId != userId)
                return null;
            return appointment;
        }

        public async Task<Appointment> CreateAppointmentAsync(Appointment appointment)
        {
            await _appointmentDAL.AddAppointmentAsync(appointment);
            return appointment;
        }

        public async Task UpdateAppointmentAsync(Appointment appointment, int userId)
        {
            var existing = await _appointmentDAL.GetAppointmentByIdAsync(appointment.Id);
            if (existing == null || existing.UserId != userId)
                throw new System.Exception("Unauthorized");

            existing.Title = appointment.Title;
            existing.Date = appointment.Date;

            await _appointmentDAL.UpdateAppointmentAsync(existing);
        }

        public async Task DeleteAppointmentAsync(int id, int userId)
        {
            var appointment = await _appointmentDAL.GetAppointmentByIdAsync(id);
            if (appointment == null || appointment.UserId != userId)
                throw new System.Exception("Unauthorized");

            await _appointmentDAL.DeleteAppointmentAsync(id);
        }
    }
}
