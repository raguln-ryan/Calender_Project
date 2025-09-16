using backend.Models;

namespace backend.Services
{
    public interface IAppointmentService
    {
        Task<List<Appointment>> GetAppointmentsByDateAsync(DateTime date);
        Task<Appointment> CreateAppointmentAsync(Appointment dto);
        Task<Appointment> UpdateAppointmentAsync(int id, Appointment dto);  // ✅ new
        Task<bool> DeleteAppointmentAsync(int id);
        Task<List<Appointment>> GetUpcomingAppointmentsAsync(DateTime start, DateTime end); // ✅ new
    }
}
