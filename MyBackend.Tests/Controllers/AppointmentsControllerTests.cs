using Backend.BusinessLayer;
using Backend.Controllers;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

namespace Backend.Tests.Controllers
{
    public class AppointmentsControllerTests
    {
        private readonly Mock<IAppointmentBL> _mockBL;
        private readonly AppointmentsController _controller;

        public AppointmentsControllerTests()
        {
            _mockBL = new Mock<IAppointmentBL>();
            _controller = new AppointmentsController(_mockBL.Object);

            // Mock user identity
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1")
            }, "mock"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext { User = user }
            };
        }

        // --------------------
        // GET Upcoming
        // --------------------
        [Fact]
        public async Task GetUpcomingAppointments_ReturnsOkWithAppointments()
        {
            var userId = 1;
            var appointments = new List<Appointment>
            {
                new Appointment { Id = 1, Title = "Test", StartTime = DateTime.UtcNow, EndTime = DateTime.UtcNow.AddHours(1), UserId = userId }
            };

            _mockBL.Setup(x => x.GetAppointmentsByUserAsync(userId)).ReturnsAsync(appointments);

            var result = await _controller.GetUpcomingAppointments();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(appointments, okResult.Value);
        }

        // --------------------
        // CREATE Appointment
        // --------------------
        [Fact]
        public async Task CreateAppointment_ReturnsCreatedAtAction_WhenSuccessful()
        {
            var dto = new CreateAppointmentDto
            {
                Title = "Meeting",
                Description = "Team sync",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddHours(1)
            };

            var createdAppointment = new Appointment { Id = 1, Title = dto.Title, StartTime = dto.StartTime, EndTime = dto.EndTime, UserId = 1 };

            _mockBL.Setup(x => x.CreateAppointmentAsync(dto, 1)).ReturnsAsync(createdAppointment);

            var result = await _controller.CreateAppointment(dto);

            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(createdAppointment, createdResult.Value);
        }

        [Fact]
        public async Task CreateAppointment_ReturnsConflict_WhenAppointmentConflicts()
        {
            var dto = new CreateAppointmentDto
            {
                Title = "Meeting",
                Description = "Team sync",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddHours(1)
            };

            _mockBL.Setup(x => x.CreateAppointmentAsync(dto, 1))
                   .ThrowsAsync(new Exception("Appointment conflicts with an existing appointment."));

            var result = await _controller.CreateAppointment(dto);

            var conflictResult = Assert.IsType<ConflictObjectResult>(result);
            Assert.Contains("conflicts", conflictResult.Value.ToString());
        }

        [Fact]
        public async Task CreateAppointment_ReturnsBadRequest_WhenValidationFails()
        {
            var dto = new CreateAppointmentDto
            {
                Title = "", // invalid: title required
                Description = "Test",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddHours(1)
            };

            _mockBL.Setup(x => x.CreateAppointmentAsync(dto, 1))
                   .ThrowsAsync(new Exception("Title is required."));

            var result = await _controller.CreateAppointment(dto);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Title is required", badRequest.Value.ToString());
        }

        // --------------------
        // UPDATE Appointment
        // --------------------
        [Fact]
        public async Task UpdateAppointment_ReturnsNoContent_WhenSuccessful()
        {
            var dto = new UpdateAppointmentDto
            {
                Title = "Updated",
                Description = "Updated desc",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddHours(1)
            };

            _mockBL.Setup(x => x.UpdateAppointmentAsync(1, dto, 1)).ReturnsAsync(true);

            var result = await _controller.UpdateAppointment(1, dto);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task UpdateAppointment_ReturnsNotFound_WhenAppointmentDoesNotExist()
        {
            var dto = new UpdateAppointmentDto
            {
                Title = "Updated",
                Description = "Updated desc",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddHours(1)
            };

            _mockBL.Setup(x => x.UpdateAppointmentAsync(1, dto, 1)).ReturnsAsync(false);

            var result = await _controller.UpdateAppointment(1, dto);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task UpdateAppointment_ReturnsConflict_WhenAppointmentConflicts()
        {
            var dto = new UpdateAppointmentDto
            {
                Title = "Updated",
                Description = "Updated desc",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddHours(1)
            };

            _mockBL.Setup(x => x.UpdateAppointmentAsync(1, dto, 1))
                   .ThrowsAsync(new Exception("Updated appointment conflicts with an existing appointment."));

            var result = await _controller.UpdateAppointment(1, dto);

            var conflictResult = Assert.IsType<ConflictObjectResult>(result);
            Assert.Contains("conflicts", conflictResult.Value.ToString());
        }

        [Fact]
        public async Task UpdateAppointment_ReturnsBadRequest_WhenValidationFails()
        {
            var dto = new UpdateAppointmentDto
            {
                Title = "", // invalid
                Description = "Updated desc",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddHours(1)
            };

            _mockBL.Setup(x => x.UpdateAppointmentAsync(1, dto, 1))
                   .ThrowsAsync(new Exception("Title is required."));

            var result = await _controller.UpdateAppointment(1, dto);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Title is required", badRequest.Value.ToString());
        }

        // --------------------
        // DELETE Appointment
        // --------------------
        [Fact]
        public async Task DeleteAppointment_ReturnsNoContent_WhenSuccessful()
        {
            _mockBL.Setup(x => x.DeleteAppointmentAsync(1, 1)).ReturnsAsync(true);

            var result = await _controller.DeleteAppointment(1);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteAppointment_ReturnsNotFound_WhenAppointmentDoesNotExist()
        {
            _mockBL.Setup(x => x.DeleteAppointmentAsync(1, 1)).ReturnsAsync(false);

            var result = await _controller.DeleteAppointment(1);

            Assert.IsType<NotFoundResult>(result);
        }
    }
}
