using backend.Models;
using backend.Repositories;

namespace backend.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _repository;

        public AppointmentService(IAppointmentRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<Appointment>> GetAppointmentsByDateAsync(DateTime date)
        {
            return await _repository.GetAppointmentsByDateAsync(date);
        }

        public async Task<Appointment> CreateAppointmentAsync(Appointment dto)
        {
            var conflict = await _repository.HasConflictAsync(dto.StartTime, dto.EndTime);
            if (conflict)
            {
                throw new InvalidOperationException("Appointment conflict detected!");
            }

            await _repository.AddAsync(dto);
            await _repository.SaveChangesAsync();

            return dto;
        }

        public async Task<Appointment> UpdateAppointmentAsync(int id, Appointment dto)
        {
            var appointment = await _repository.GetByIdAsync(id);
            if (appointment == null)
                throw new KeyNotFoundException("Appointment not found.");

            // Check conflicts excluding itself
            var conflict = await _repository.HasConflictAsync(dto.StartTime, dto.EndTime);
            if (conflict && (dto.StartTime != appointment.StartTime || dto.EndTime != appointment.EndTime))
                throw new InvalidOperationException("Appointment conflict detected!");

            //This is in-memory change, not yet saved to DB.
            appointment.Title = dto.Title;
            appointment.Description = dto.Description;
            appointment.StartTime = dto.StartTime;
            appointment.EndTime = dto.EndTime;

            await _repository.SaveChangesAsync();
            return appointment;
        }

        public async Task<bool> DeleteAppointmentAsync(int id)
        {
            var appointment = await _repository.GetByIdAsync(id);
            if (appointment == null) return false;

            await _repository.DeleteAsync(appointment);
            await _repository.SaveChangesAsync();

            return true;
        }

        public async Task<List<Appointment>> GetUpcomingAppointmentsAsync(DateTime start, DateTime end)
        {
            return await _repository.GetAppointmentsInRangeAsync(start, end);
        }
    }
}
