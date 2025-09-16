using backend.Data;
using backend.Repositories;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.IO;
using Microsoft.OpenApi.Writers;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Appointments API",
        Version = "v1",
        Description = "API for managing appointments"
    });
});

// Register DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    ));

// Register services & repositories
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();

// Add CORS policy for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", builder =>
    {
        builder.WithOrigins("http://localhost:3000")
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

var app = builder.Build();

// Enable Swagger JSON
app.UseSwagger(c =>
{
    c.RouteTemplate = "swagger/{documentName}/swagger.json";
});

// Enable Swagger UI
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Appointments API V1");
});

// Use CORS
app.UseCors("AllowReactApp");

// Middleware
app.UseRouting();
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Default API test route
app.MapGet("/api", () => Results.Json(new
{
    status = "ok",
    message = "API is running. Use /api/appointments for endpoints."
}));

// Optional: Generate static YAML file at startup
var swaggerProvider = app.Services.GetRequiredService<Swashbuckle.AspNetCore.Swagger.ISwaggerProvider>();
var swaggerDoc = swaggerProvider.GetSwagger("v1");

app.MapGet("/swagger/v1/swagger.yaml", async (HttpContext context, ISwaggerProvider swaggerProvider) =>
{
    var swagger = swaggerProvider.GetSwagger("v1");
    var sb = new StringBuilder();
    var writer = new OpenApiYamlWriter(new StringWriter(sb));
    swagger.SerializeAsV3(writer);
    await context.Response.WriteAsync(sb.ToString());
});

Directory.CreateDirectory("SwaggerDocs"); // Ensure folder exists
using (var stream = new StreamWriter("SwaggerDocs/api.yaml"))
{
    swaggerDoc.SerializeAsV3(new OpenApiYamlWriter(stream));
}

app.Run();
