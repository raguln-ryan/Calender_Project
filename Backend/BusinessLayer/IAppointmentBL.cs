using Backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.BusinessLayer
{
    public interface IAppointmentBL
    {
        Task<IEnumerable<Appointment>> GetAppointmentsByUserAsync(int userId);
        Task<Appointment> GetAppointmentByIdAsync(int id, int userId);
        Task<Appointment> CreateAppointmentAsync(Appointment appointment);
        Task UpdateAppointmentAsync(Appointment appointment, int userId);
        Task DeleteAppointmentAsync(int id, int userId);
    }
}
