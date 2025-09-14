using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class AppointmentRequest
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(50, ErrorMessage = "Title cannot be longer than 50 characters")]
        [RegularExpression(@"^[a-zA-Z\s.,!?-]+$", ErrorMessage = "Title should contain only letters and basic punctuation")]
        public string Title { get; set; }

        [StringLength(200, ErrorMessage = "Description cannot be longer than 200 characters")]
        public string Description { get; set; }

        // Date sent from frontend as "YYYY-MM-DD"
        [Required(ErrorMessage = "Date is required")]
        public string Date { get; set; }

        // Times in "HH:mm" format
        [Required(ErrorMessage = "Start time is required")]
        public string StartTime { get; set; }

        [Required(ErrorMessage = "End time is required")]
        public string EndTime { get; set; }

        public string Type { get; set; } // optional, if you want to store it later
    }
}
