using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Appointment
    {
        [Key]
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Title is required")]
        [StringLength(50, ErrorMessage = "Title cannot be longer than 50 characters")]
        [RegularExpression(@"^[a-zA-Z\s.,!?-]+$", ErrorMessage = "Title should contain only letters and basic punctuation")]
        public string Title { get; set; }
        
        [Required(ErrorMessage = "Description is required")]
        [StringLength(200, ErrorMessage = "Description cannot be longer than 200 characters")]
        public string Description { get; set; }
        
        [Required(ErrorMessage = "Start time is required")]
        public DateTime StartTime { get; set; }
        
        [Required(ErrorMessage = "End time is required")]
        public DateTime EndTime { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
