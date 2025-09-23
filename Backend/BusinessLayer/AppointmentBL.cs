using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.BusinessLayer
{
    public class AppointmentBL : IAppointmentBL
    {
        private readonly AppDbContext _context;

        public AppointmentBL(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Appointment>> GetAppointmentsByUserAsync(int userId)
        {
            return await _context.Appointments
                                 .AsNoTracking()
                                 .Where(a => a.UserId == userId)
                                 .ToListAsync();
        }

        public async Task<Appointment> CreateAppointmentAsync(CreateAppointmentDto dto, int userId)
        {
            var appointment = new Appointment
            {
                Title = dto.Title,
                Description = dto.Description,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                UserId = userId,
                CreatedAt = System.DateTime.UtcNow
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return appointment;
        }

        public async Task<bool> UpdateAppointmentAsync(int id, UpdateAppointmentDto dto, int userId)
        {
            var existing = await _context.Appointments
                                         .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
            if (existing == null)
                return false;

            existing.Title = dto.Title;
            existing.Description = dto.Description;
            existing.StartTime = dto.StartTime;
            existing.EndTime = dto.EndTime;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAppointmentAsync(int id, int userId)
        {
            var appointment = await _context.Appointments
                                            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
            if (appointment == null) return false;

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _context.Users
                                 .AsNoTracking()
                                 .FirstOrDefaultAsync(u => u.Username == username);
        }
    }
}
