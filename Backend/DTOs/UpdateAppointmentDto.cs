using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class UpdateAppointmentDto
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
