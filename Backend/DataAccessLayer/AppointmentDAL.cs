using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.DataAccessLayer
{
    public class AppointmentDAL : IAppointmentDAL
    {
        private readonly AppDbContext _context;

        public AppointmentDAL(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsByUserAsync(int userId)
        {
            return await _context.Appointments
                .Where(a => a.UserId == userId)
                .ToListAsync();
        }

        public async Task<Appointment> GetAppointmentByIdAsync(int id)
        {
            return await _context.Appointments.FindAsync(id);
        }

        public async Task AddAppointmentAsync(Appointment appointment)
        {
            if (await HasConflictAsync(appointment))
                throw new System.Exception("Appointment conflicts with an existing appointment.");

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAppointmentAsync(Appointment appointment)
        {
            // Check for conflicts before updating
            if (await HasConflictAsync(appointment, appointment.Id))
                throw new System.Exception("Updated appointment conflicts with an existing appointment.");

            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAppointmentAsync(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment != null)
            {
                _context.Appointments.Remove(appointment);
                await _context.SaveChangesAsync();
            }
        }

         public async Task<bool> HasConflictAsync(Appointment appointment, int? excludeId = null)
        {
            return await _context.Appointments
                .Where(a => a.UserId == appointment.UserId)
                .Where(a => !excludeId.HasValue || a.Id != excludeId.Value)
                .AnyAsync(a =>
                    (appointment.StartTime < a.EndTime && appointment.EndTime > a.StartTime)
                );
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsByDateRangeAsync(int userId, DateTime startDate, DateTime endDate)
        {
            return await _context.Appointments
                .Where(a => a.UserId == userId && 
                            a.StartTime >= startDate && 
                            a.StartTime <= endDate.AddDays(1)) // Add 1 day to include the entire end date
                .OrderBy(a => a.StartTime)
                .ToListAsync();
        }
    }
}
