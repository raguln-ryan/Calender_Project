import React, { useState, useEffect } from "react";
import { createAppointment, updateAppointment } from "../services/api";
import "./AddAppointmentModal.css";

const AddAppointmentModal = ({ 
  onClose, 
  selectedDate, 
  onAdd, 
  appointmentToEdit 
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState(selectedDate || new Date());
  const [error, setError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing data
  useEffect(() => {
    if (appointmentToEdit) {
      setTitle(appointmentToEdit.title || "");
      setDescription(appointmentToEdit.description || "");
      setStartTime(appointmentToEdit.startTime?.slice(11, 16) || "");
      setEndTime(appointmentToEdit.endTime?.slice(11, 16) || "");
      setDate(new Date(appointmentToEdit.startTime));
    }
  }, [appointmentToEdit]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required.";
    } else if (title.length > 50) {
      newErrors.title = "Title cannot exceed 50 characters.";
    } else if (!/^[a-zA-Z\s.,!?-]+$/.test(title)) {
      newErrors.title = "Title can only contain letters and punctuation.";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required.";
    } else if (description.length > 200) {
      newErrors.description = "Description cannot exceed 200 characters.";
    }

    if (!startTime) {
      newErrors.startTime = "Start time is required.";
    }
    if (!endTime) {
      newErrors.endTime = "End time is required.";
    }
    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = "End time must be later than start time.";
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const startDateTime = new Date(`${date.toISOString().split("T")[0]}T${startTime}`);
      const endDateTime = new Date(`${date.toISOString().split("T")[0]}T${endTime}`);

      const appointmentData = {
        title,
        description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };

      if (appointmentToEdit) {
        await updateAppointment(appointmentToEdit.id, appointmentData);
      } else {
        await createAppointment(appointmentData);
      }

      onAdd();
      alert(`Appointment ${appointmentToEdit ? "updated" : "created"} successfully!`);
      onClose();
    } catch (error) {
      console.error("Error saving appointment:", error);
      setError({ submit: "Failed to save appointment. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{appointmentToEdit ? "Edit Appointment" : "Create Appointment"}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error.submit && <div className="error-message">{error.submit}</div>}

          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Appointment title"
            />
            {error.title && <span className="error-text">{error.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this appointment"
              rows="3"
            />
            {error.description && <span className="error-text">{error.description}</span>}
          </div>

          {/* Date */}
          <div className="form-group date-picker-group">
            <label htmlFor="date">Date *</label>
            <div className="date-input-wrapper">
              <input
                type="date"
                id="date"
                value={date.toISOString().split("T")[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate)) {
                    setDate(newDate);
                  }
                }}
                required
              />
              <button
                type="button"
                className="calendar-btn"
                onClick={() => document.getElementById("date").showPicker?.()}
              >
                📅
              </button>
            </div>
          </div>

          {/* Start Time */}
          <div className="form-group">
            <label htmlFor="startTime">Start Time *</label>
            <select
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            >
              <option value="">Select start time</option>
              {generateTimeOptions().map((timeOption) => (
                <option key={timeOption} value={timeOption}>
                  {formatTimeForDisplay(timeOption)}
                </option>
              ))}
            </select>
            {error.startTime && <span className="error-text">{error.startTime}</span>}
          </div>

          {/* End Time */}
          <div className="form-group">
            <label htmlFor="endTime">End Time *</label>
            <select
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            >
              <option value="">Select end time</option>
              {generateTimeOptions().map((timeOption) => (
                <option key={timeOption} value={timeOption}>
                  {formatTimeForDisplay(timeOption)}
                </option>
              ))}
            </select>
            {error.endTime && <span className="error-text">{error.endTime}</span>}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="create-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : (appointmentToEdit ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Time options generator
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour <= 23; hour++) {
    const formattedHour = hour.toString().padStart(2, "0");
    options.push(`${formattedHour}:00`);
    options.push(`${formattedHour}:30`);
  }
  return options;
};

// Format for dropdown
const formatTimeForDisplay = (time) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export default AddAppointmentModal;
