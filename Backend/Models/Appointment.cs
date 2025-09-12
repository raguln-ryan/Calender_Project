namespace backend.Models
//models usually represents the table in the db
{
    public class Appointment //create a table appointment
    {
        //inside this all columns to the table
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now; // ✅ default value
    }
}
