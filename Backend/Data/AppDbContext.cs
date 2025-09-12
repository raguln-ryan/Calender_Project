
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        //basically like a constructor
        //options are parameter receive it from the program.cs file
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Appointment> Appointments { get; set; }
        //appointment table we set and update the values
        //get - > fetch
        //set -> insert
    }
}
