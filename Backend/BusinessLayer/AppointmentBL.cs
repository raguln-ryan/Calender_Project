using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
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

        public async Task<List<Appointment>> GetAppointmentsByDateRangeAsync(int userId, DateTime startDate, DateTime endDate)
        {
            return await _context.Appointments
                                 .AsNoTracking()
                                 .Where(a => a.UserId == userId && 
                                            a.StartTime >= startDate && 
                                            a.StartTime <= endDate.AddDays(1)) // Add 1 day to include the entire end date
                                 .OrderBy(a => a.StartTime)
                                 .ToListAsync();
        }

        public async Task<Appointment> CreateAppointmentAsync(CreateAppointmentDto dto, int userId)
        {
            // Run validations
            var errors = await ValidateAppointmentAsync(dto.Title, dto.Description, dto.StartTime, dto.EndTime, userId);
            if (errors.Count > 0)
                throw new System.Exception(string.Join("; ", errors));

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

            // Run validations (exclude current appointment for conflict check)
            var errors = await ValidateAppointmentAsync(dto.Title, dto.Description, dto.StartTime, dto.EndTime, userId, id);
            if (errors.Count > 0)
                throw new System.Exception(string.Join("; ", errors));

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

        public async Task<bool> HasConflictAsync(int userId, System.DateTime startTime, System.DateTime endTime, int? excludeAppointmentId = null)
        {
            var query = _context.Appointments
                                .Where(a => a.UserId == userId &&
                                            a.StartTime < endTime &&
                                            a.EndTime > startTime);

            if (excludeAppointmentId.HasValue)
                query = query.Where(a => a.Id != excludeAppointmentId.Value);

            return await query.AnyAsync();
        }

        // ---------------------------
        // Validator method
        // ---------------------------
        private async Task<List<string>> ValidateAppointmentAsync(string title, string? description, System.DateTime startTime, System.DateTime endTime, int userId, int? excludeAppointmentId = null)
        {
            var errors = new List<string>();

            // Title validation
            if (string.IsNullOrWhiteSpace(title))
                errors.Add("Title is required.");
            else if (title.Length > 30)
                errors.Add("Title must be at most 30 characters.");
            else if (!Regex.IsMatch(title, @"^[a-zA-Z\s]+$"))
                errors.Add("Title must contain only letters and spaces.");

            // Description validation
            if (!string.IsNullOrEmpty(description))
            {
                if (description.Length > 50)
                    errors.Add("Description must be at most 50 characters.");
                else if (!Regex.IsMatch(description, @"^[a-zA-Z0-9\s]*$"))
                    errors.Add("Description can contain only letters, numbers, and spaces.");
            }

            // Start/End time validation
            if (endTime <= startTime)
                errors.Add("EndTime must be after StartTime.");

            // Conflict check
            if (await HasConflictAsync(userId, startTime, endTime, excludeAppointmentId))
                errors.Add("Appointment conflicts with an existing appointment.");

            return errors;
        }
    }
}
