using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class CreateAppointmentDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }
    }
}
