using Backend.Data;
using Backend.DataAccessLayer;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Backend.Tests.DataAccessLayer
{
    public class AppointmentDALTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()) // unique DB per test
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public async Task GetAppointmentsByUserAsync_ShouldReturnOnlyUserAppointments()
        {
            using var context = GetDbContext();
            context.Appointments.Add(new Appointment { Id = 1, UserId = 1, Title = "A1", StartTime = DateTime.Now, EndTime = DateTime.Now.AddHours(1) });
            context.Appointments.Add(new Appointment { Id = 2, UserId = 2, Title = "A2", StartTime = DateTime.Now, EndTime = DateTime.Now.AddHours(1) });
            await context.SaveChangesAsync();

            var dal = new AppointmentDAL(context);
            var result = await dal.GetAppointmentsByUserAsync(1);

            Assert.Single(result);
            Assert.Equal(1, result.First().UserId);
        }

        [Fact]
        public async Task GetAppointmentByIdAsync_ShouldReturnAppointment()
        {
            using var context = GetDbContext();
            context.Appointments.Add(new Appointment { Id = 1, UserId = 1, Title = "Test", StartTime = DateTime.Now, EndTime = DateTime.Now.AddHours(1) });
            await context.SaveChangesAsync();

            var dal = new AppointmentDAL(context);
            var appointment = await dal.GetAppointmentByIdAsync(1);

            Assert.NotNull(appointment);
            Assert.Equal("Test", appointment.Title);
        }

        [Fact]
        public async Task AddAppointmentAsync_ShouldAdd_WhenNoConflict()
        {
            using var context = GetDbContext();
            var dal = new AppointmentDAL(context);

            var appt = new Appointment { Id = 1, UserId = 1, Title = "New", StartTime = DateTime.Now, EndTime = DateTime.Now.AddHours(1) };
            await dal.AddAppointmentAsync(appt);

            Assert.Single(context.Appointments);
        }

        [Fact]
        public async Task AddAppointmentAsync_ShouldThrow_WhenConflictExists()
        {
            using var context = GetDbContext();
            var dal = new AppointmentDAL(context);

            var now = DateTime.Now;
            context.Appointments.Add(new Appointment { Id = 1, UserId = 1, Title = "Existing", StartTime = now, EndTime = now.AddHours(2) });
            await context.SaveChangesAsync();

            var conflict = new Appointment { Id = 2, UserId = 1, Title = "Conflict", StartTime = now.AddMinutes(30), EndTime = now.AddHours(1) };

            await Assert.ThrowsAsync<Exception>(() => dal.AddAppointmentAsync(conflict));
        }

        [Fact]
        public async Task UpdateAppointmentAsync_ShouldUpdate_WhenNoConflict()
        {
            using var context = GetDbContext();
            var now = DateTime.Now;
            var appt = new Appointment { Id = 1, UserId = 1, Title = "Old", StartTime = now, EndTime = now.AddHours(1) };
            context.Appointments.Add(appt);
            await context.SaveChangesAsync();

            var dal = new AppointmentDAL(context);
            appt.Title = "Updated";
            await dal.UpdateAppointmentAsync(appt);

            var updated = await context.Appointments.FindAsync(1);
            Assert.Equal("Updated", updated.Title);
        }

        [Fact]
        public async Task UpdateAppointmentAsync_ShouldThrow_WhenConflictExists()
        {
            using var context = GetDbContext();
            var now = DateTime.Now;

            context.Appointments.Add(new Appointment { Id = 1, UserId = 1, Title = "Existing", StartTime = now, EndTime = now.AddHours(2) });
            context.Appointments.Add(new Appointment { Id = 2, UserId = 1, Title = "ToUpdate", StartTime = now.AddHours(3), EndTime = now.AddHours(4) });
            await context.SaveChangesAsync();

            var dal = new AppointmentDAL(context);
            var toUpdate = await context.Appointments.FindAsync(2);
            toUpdate.StartTime = now.AddMinutes(30); // overlapping with ID=1
            toUpdate.EndTime = now.AddHours(1);

            await Assert.ThrowsAsync<Exception>(() => dal.UpdateAppointmentAsync(toUpdate));
        }

        [Fact]
        public async Task DeleteAppointmentAsync_ShouldRemove_WhenExists()
        {
            using var context = GetDbContext();
            context.Appointments.Add(new Appointment { Id = 1, UserId = 1, Title = "Delete", StartTime = DateTime.Now, EndTime = DateTime.Now.AddHours(1) });
            await context.SaveChangesAsync();

            var dal = new AppointmentDAL(context);
            await dal.DeleteAppointmentAsync(1);

            Assert.Empty(context.Appointments);
        }

        [Fact]
        public async Task HasConflictAsync_ShouldReturnTrue_WhenOverlapping()
        {
            using var context = GetDbContext();
            var now = DateTime.Now;
            context.Appointments.Add(new Appointment { Id = 1, UserId = 1, Title = "Base", StartTime = now, EndTime = now.AddHours(2) });
            await context.SaveChangesAsync();

            var dal = new AppointmentDAL(context);
            var conflict = new Appointment { Id = 2, UserId = 1, StartTime = now.AddMinutes(30), EndTime = now.AddHours(1) };

            var result = await dal.HasConflictAsync(conflict);
            Assert.True(result);
        }
    }
}
