using Backend.BusinessLayer;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using Xunit;

namespace Backend.Tests.BusinessLayer
{
    public class AppointmentBLTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()) // Unique DB for each test
                .Options;

            return new AppDbContext(options);
        }

        [Fact]
        public async Task CreateAppointmentAsync_ShouldCreateAppointment()
        {
            var context = GetDbContext();
            var bl = new AppointmentBL(context);

            var dto = new CreateAppointmentDto
            {
                Title = "Meeting",
                Description = "Team sync",
                StartTime = DateTime.UtcNow.AddHours(1),
                EndTime = DateTime.UtcNow.AddHours(2)
            };

            var appointment = await bl.CreateAppointmentAsync(dto, userId: 1);

            Assert.NotNull(appointment);
            Assert.Equal(dto.Title, appointment.Title);
            Assert.Equal(dto.Description, appointment.Description);
        }

        [Fact]
        public async Task GetAppointmentsByUserAsync_ShouldReturnAppointments()
        {
            var context = GetDbContext();
            context.Appointments.Add(new Appointment
            {
                Id = 1,
                UserId = 1,
                Title = "Test",
                Description = "Desc",
                StartTime = DateTime.UtcNow.AddHours(1),
                EndTime = DateTime.UtcNow.AddHours(2),
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();

            var bl = new AppointmentBL(context);
            var result = await bl.GetAppointmentsByUserAsync(1);

            Assert.Single(result);
        }

        [Fact]
        public async Task UpdateAppointmentAsync_ShouldReturnTrue_WhenExists()
        {
            var context = GetDbContext();
            context.Appointments.Add(new Appointment
            {
                Id = 1,
                UserId = 1,
                Title = "Old",
                Description = "Old Desc",
                StartTime = DateTime.UtcNow.AddHours(1),
                EndTime = DateTime.UtcNow.AddHours(2),
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();

            var bl = new AppointmentBL(context);

            var dto = new UpdateAppointmentDto
            {
                Title = "Updated",
                Description = "Updated Desc",
                StartTime = DateTime.UtcNow.AddHours(3),
                EndTime = DateTime.UtcNow.AddHours(4)
            };

            var result = await bl.UpdateAppointmentAsync(1, dto, 1);

            Assert.True(result);
        }

        [Fact]
        public async Task DeleteAppointmentAsync_ShouldReturnTrue_WhenExists()
        {
            var context = GetDbContext();
            context.Appointments.Add(new Appointment
            {
                Id = 1,
                UserId = 1,
                Title = "ToDelete",
                Description = "Desc",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddHours(1),
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();

            var bl = new AppointmentBL(context);
            var result = await bl.DeleteAppointmentAsync(1, 1);

            Assert.True(result);
        }

        [Fact]
        public async Task HasConflictAsync_ShouldReturnTrue_WhenConflictExists()
        {
            var context = GetDbContext();
            context.Appointments.Add(new Appointment
            {
                Id = 1,
                UserId = 1,
                Title = "Existing",
                Description = "Desc",
                StartTime = DateTime.UtcNow.AddHours(1),
                EndTime = DateTime.UtcNow.AddHours(2),
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();

            var bl = new AppointmentBL(context);

            var result = await bl.HasConflictAsync(1, DateTime.UtcNow.AddHours(1.5), DateTime.UtcNow.AddHours(2.5));

            Assert.True(result);
        }

        


    }
}
