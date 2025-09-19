using backend.Models;

namespace backend.Repositories
{
    public interface IAppointmentRepository
    {
        Task<List<Appointment>> GetAppointmentsByDateAsync(DateTime date);
        Task<Appointment?> GetByIdAsync(int id);
        Task<bool> HasConflictAsync(DateTime start, DateTime end);
        Task AddAsync(Appointment appointment);
        Task DeleteAsync(Appointment appointment);
        Task SaveChangesAsync();

        Task<List<Appointment>> GetAppointmentsInRangeAsync(DateTime start, DateTime end); // ✅ new
    }
}
