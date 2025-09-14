using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using backend.Data; // or the actual namespace for AppDbContext
using System.Text.Json;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
});

// Configure DbContext with MySQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    ));

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

// Enable Swagger JSON and UI as usual
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API v1");
    // Optional: host UI at root
    // c.RoutePrefix = string.Empty;
});

// New: Live YAML endpoint
app.MapGet("/swagger.yaml", () =>
{
    // Get the Swagger document for version v1
    var swaggerProvider = app.Services.GetRequiredService<Swashbuckle.AspNetCore.Swagger.ISwaggerProvider>();
    var swagger = swaggerProvider.GetSwagger("v1");

    // Convert the OpenAPI document to JSON, then to YAML
    var json = JsonSerializer.Serialize(swagger);
    var dict = JsonSerializer.Deserialize<Dictionary<string, object>>(json);

    var serializer = new SerializerBuilder()
        .WithNamingConvention(CamelCaseNamingConvention.Instance)
        .Build();

    var yaml = serializer.Serialize(dict);

    return Results.Text(yaml, "application/x-yaml");
});

app.MapControllers();
app.Run();
