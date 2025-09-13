using backend.Data;
using Microsoft.EntityFrameworkCore;

/// The web application used to configure the HTTP pipeline, and routes.
var builder = WebApplication.CreateBuilder(args);


// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ✅ Register AppDbContext with MySQL connection
// Tells EF Core to use MySQL as the database provider.
// Reads the connection string from your appsettings.json.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        // 
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    )
);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthorization();
app.UseCors("AllowFrontend");

app.MapControllers();

app.Run();
