using backend.Models;

namespace backend.Services
{
    public interface IAppointmentService
    {
        Task<List<Appointment>> GetAppointmentsByDateAsync(DateTime date);
        Task<Appointment> CreateAppointmentAsync(Appointment dto);
        Task<bool> DeleteAppointmentAsync(int id);
    }
}
