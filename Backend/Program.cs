using Backend.BusinessLayer;
using Backend.Data;
using Backend.DataAccessLayer;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// -----------------------
// Add DbContext (MySQL)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 33))
    )
);

// -----------------------
// Dependency Injection
builder.Services.AddScoped<IUserDAL, UserDAL>();
builder.Services.AddScoped<IUserBL, UserBL>();
builder.Services.AddScoped<IAppointmentDAL, AppointmentDAL>();
builder.Services.AddScoped<IAppointmentBL, AppointmentBL>();
builder.Services.AddSingleton<JwtService>(); 
builder.Services.AddScoped<IJwtService, JwtService>();


// -----------------------
// JWT Authentication
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
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Calendar App API", Version = "v1" });

    // --- This is the key part ---
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",   // MUST be lowercase
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your JWT token.\r\nExample: \"Bearer eyJhbGciOiJI...\""
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});
// -----------------------
// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder
            .AllowAnyOrigin()   // allow requests from any origin
            .AllowAnyMethod()   // allow GET, POST, PUT, DELETE, etc.
            .AllowAnyHeader();  // allow headers like Authorization
    });
});


// -----------------------
// Build & Configure App
var app = builder.Build();

// -----------------------
// Swagger Middleware
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Calendar App API V1");
    c.RoutePrefix = "swagger"; 
    c.DisplayRequestDuration();
});

// -----------------------
// Authentication & Authorization
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// -----------------------
// Map Controllers
app.MapControllers();

app.Run();
