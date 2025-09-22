using Backend.BusinessLayer;
using Backend.Data;
using Backend.DataAccessLayer;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// -----------------------
// Add DbContext (MySQL)
// -----------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 33))
    )
);

// -----------------------
// Dependency Injection: BL & DAL
// -----------------------
builder.Services.AddScoped<IUserDAL, UserDAL>();
builder.Services.AddScoped<IUserBL, UserBL>();
builder.Services.AddScoped<IAppointmentDAL, AppointmentDAL>();
builder.Services.AddScoped<IAppointmentBL, AppointmentBL>();

// -----------------------
// JWT Authentication
// -----------------------
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"];

if (string.IsNullOrEmpty(secretKey))
    throw new InvalidOperationException("JWT Secret is missing in appsettings.json");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });

// -----------------------
// Controllers & Swagger
// -----------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// -----------------------
// Build & Configure App
// -----------------------
var app = builder.Build();

// -----------------------
// Swagger Middleware
// -----------------------
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Calendar App API V1");
    c.RoutePrefix = string.Empty; // Swagger opens at root: http://localhost:5000/
});

// -----------------------
// Authentication & Authorization
// -----------------------
app.UseAuthentication();
app.UseAuthorization();

// -----------------------
// Map Controllers
// -----------------------
app.MapControllers();

app.Run();
