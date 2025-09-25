using Backend.BusinessLayer;
using Backend.DTOs;
using Moq;
using System;
using System.Threading.Tasks;
using Xunit;

namespace Backend.Tests.BusinessLayer
{
    public class AppointmentValidatorTests
    {
        private readonly Mock<IAppointmentBL> _mockAppointmentBL;
        private readonly AppointmentValidator _validator;

        public AppointmentValidatorTests()
        {
            _mockAppointmentBL = new Mock<IAppointmentBL>();
            _validator = new AppointmentValidator(_mockAppointmentBL.Object);
        }

        [Fact]
        public async Task ValidateCreateAsync_ShouldReturnNoErrors_WhenValid()
        {
            // Arrange
            var dto = new CreateAppointmentDto
            {
                Title = "Meeting",
                Description = "Discuss project",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddHours(1)
            };

            _mockAppointmentBL
                .Setup(x => x.HasConflictAsync(It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), null))
                .ReturnsAsync(false);

            // Act
            var result = await _validator.ValidateCreateAsync(dto, 1);

            // Assert
            Assert.Empty(result); // ✅ Should be valid
        }

        [Fact]
        public async Task ValidateCreateAsync_ShouldReturnError_WhenTitleIsMissing()
        {
            // Arrange
            var dto = new CreateAppointmentDto
            {
                Title = "",
                Description = "Some description",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddHours(1)
            };

            _mockAppointmentBL
                .Setup(x => x.HasConflictAsync(It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), null))
                .ReturnsAsync(false);

            // Act
            var result = await _validator.ValidateCreateAsync(dto, 1);

            // Assert
            Assert.Contains("Title is required.", result);
        }

        [Fact]
        public async Task ValidateCreateAsync_ShouldReturnError_WhenTimesInvalid()
        {
            // Arrange
            var dto = new CreateAppointmentDto
            {
                Title = "Meeting",
                Description = "Valid desc",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddMinutes(-5) // ❌ End before start
            };

            _mockAppointmentBL
                .Setup(x => x.HasConflictAsync(It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), null))
                .ReturnsAsync(false);

            // Act
            var result = await _validator.ValidateCreateAsync(dto, 1);

            // Assert
            Assert.Contains("EndTime must be after StartTime.", result);
        }

        [Fact]
        public async Task ValidateCreateAsync_ShouldReturnError_WhenConflictExists()
        {
            // Arrange
            var dto = new CreateAppointmentDto
            {
                Title = "Meeting",
                Description = "Overlap",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddHours(1)
            };

            _mockAppointmentBL
                .Setup(x => x.HasConflictAsync(It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), null))
                .ReturnsAsync(true);

            // Act
            var result = await _validator.ValidateCreateAsync(dto, 1);

            // Assert
            Assert.Contains("Appointment conflicts with an existing appointment.", result);
        }

        [Fact]
        public async Task ValidateUpdateAsync_ShouldReturnError_WhenConflictExists()
        {
            // Arrange
            var dto = new UpdateAppointmentDto
            {
                Title = "Updated Meeting",
                Description = "Valid",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddHours(2)
            };

            _mockAppointmentBL
                .Setup(x => x.HasConflictAsync(It.IsAny<int>(), It.IsAny<DateTime>(), It.IsAny<DateTime>(), 5))
                .ReturnsAsync(true);

            // Act
            var result = await _validator.ValidateUpdateAsync(dto, 1, 5);

            // Assert
            Assert.Contains("Updated appointment conflicts with an existing appointment.", result);
        }
    }
}
