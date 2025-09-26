using Backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.DataAccessLayer
{
    public interface IAppointmentDAL
    {
        Task<IEnumerable<Appointment>> GetAppointmentsByUserAsync(int userId);
        Task<IEnumerable<Appointment>> GetAppointmentsByDateRangeAsync(int userId, DateTime startDate, DateTime endDate);
        Task<Appointment> GetAppointmentByIdAsync(int id);
        Task AddAppointmentAsync(Appointment appointment);
        Task UpdateAppointmentAsync(Appointment appointment);
        Task DeleteAppointmentAsync(int id);

        Task<bool> HasConflictAsync(Appointment appointment, int? excludeId = null);
    }
}
