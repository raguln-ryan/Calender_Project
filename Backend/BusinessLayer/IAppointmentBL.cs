using Backend.DTOs;
using Backend.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.BusinessLayer
{
    public interface IAppointmentBL
    {
        Task<List<Appointment>> GetAppointmentsByUserAsync(int userId);
        Task<List<Appointment>> GetAppointmentsByDateRangeAsync(int userId, DateTime startDate, DateTime endDate); // New method
        Task<Appointment> CreateAppointmentAsync(CreateAppointmentDto dto, int userId);
        Task<bool> UpdateAppointmentAsync(int id, UpdateAppointmentDto dto, int userId);
        Task<bool> DeleteAppointmentAsync(int id, int userId);
        Task<User?> GetUserByUsernameAsync(string username); // username lookup

        Task<bool> HasConflictAsync(int userId, System.DateTime startTime, System.DateTime endTime, int? excludeAppointmentId = null);
    }
}
