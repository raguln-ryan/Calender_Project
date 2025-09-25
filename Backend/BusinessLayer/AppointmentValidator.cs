using Backend.DTOs;
using Backend.Models;
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Backend.BusinessLayer
{
    public class AppointmentValidator
    {
        private readonly IAppointmentBL _appointmentBL;

        public AppointmentValidator(IAppointmentBL appointmentBL)
        {
            _appointmentBL = appointmentBL;
        }

        public async Task<List<string>> ValidateCreateAsync(CreateAppointmentDto dto, int userId)
        {
            var errors = new List<string>();

            // Title: required, only letters, max length 30
            if (string.IsNullOrWhiteSpace(dto.Title))
                errors.Add("Title is required.");
            else if (dto.Title.Length > 30)
                errors.Add("Title must be at most 30 characters.");
            else if (!Regex.IsMatch(dto.Title, @"^[a-zA-Z\s]+$"))
                errors.Add("Title must contain only letters and spaces.");

            // Description: optional, letters and numbers, max length 50
            if (!string.IsNullOrEmpty(dto.Description))
            {
                if (dto.Description.Length > 50)
                    errors.Add("Description must be at most 50 characters.");
                else if (!Regex.IsMatch(dto.Description, @"^[a-zA-Z0-9\s]*$"))
                    errors.Add("Description can contain only letters, numbers, and spaces.");
            }

            // Start and End times
            if (dto.EndTime <= dto.StartTime)
                errors.Add("EndTime must be after StartTime.");

            // Conflict check
            if (await _appointmentBL.HasConflictAsync(userId, dto.StartTime, dto.EndTime))
                errors.Add("Appointment conflicts with an existing appointment.");

            return errors;
        }

        public async Task<List<string>> ValidateUpdateAsync(UpdateAppointmentDto dto, int userId, int appointmentId)
        {
            var errors = new List<string>();

            // Title: required, only letters, max length 30
            if (string.IsNullOrWhiteSpace(dto.Title))
                errors.Add("Title is required.");
            else if (dto.Title.Length > 30)
                errors.Add("Title must be at most 30 characters.");
            else if (!Regex.IsMatch(dto.Title, @"^[a-zA-Z\s]+$"))
                errors.Add("Title must contain only letters and spaces.");

            // Description: optional, letters and numbers, max length 50
            if (!string.IsNullOrEmpty(dto.Description))
            {
                if (dto.Description.Length > 50)
                    errors.Add("Description must be at most 50 characters.");
                else if (!Regex.IsMatch(dto.Description, @"^[a-zA-Z0-9\s]*$"))
                    errors.Add("Description can contain only letters, numbers, and spaces.");
            }

            // Start and End times
            if (dto.EndTime <= dto.StartTime)
                errors.Add("EndTime must be after StartTime.");

            // Conflict check excluding current appointment
            if (await _appointmentBL.HasConflictAsync(userId, dto.StartTime, dto.EndTime, appointmentId))
                errors.Add("Updated appointment conflicts with an existing appointment.");

            return errors;
        }
    }
}
