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

        public async Task<bool> DeleteAppointmentAsync(int id)
        {
            var appointment = await _repository.GetByIdAsync(id);
            if (appointment == null) return false;

            await _repository.DeleteAsync(appointment);
            await _repository.SaveChangesAsync();

            return true;
        }
    }
}
