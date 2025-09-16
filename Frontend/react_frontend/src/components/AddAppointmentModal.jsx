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
  const [type, setType] = useState("Meeting"); // ✅ default type
  const [error, setError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Color mapping for appointment types
  const typeColors = {
    Meeting: "#4CAF50",   // green
    Call: "#2196F3",      // blue
    Task: "#FF9800",      // orange
    Personal: "#9C27B0"   // purple
  };

  // Initialize form with existing data
  useEffect(() => {
    if (appointmentToEdit) {
      setTitle(appointmentToEdit.title || "");
      setDescription(appointmentToEdit.description || "");
      setStartTime(appointmentToEdit.startTime?.slice(11, 16) || "");
      setEndTime(appointmentToEdit.endTime?.slice(11, 16) || "");
      setDate(new Date(appointmentToEdit.startTime));
      setType(appointmentToEdit.type || "Meeting"); // ✅ prefill type
    }
  }, [appointmentToEdit]);

  // Real-time validation
  useEffect(() => {
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
    } else if (description.length > 100) {
      newErrors.description = "Description cannot exceed 100 characters.";
    } else if (!/^[a-zA-Z0-9\s.,!?-]+$/.test(description)) {
      newErrors.description = "Description can only contain letters, numbers, and punctuation.";
    }

    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = "End time must be later than start time.";
    }

    setError(newErrors);
  }, [title, description, startTime, endTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(error).length > 0 || !title || !description || !startTime || !endTime) return;

    setIsSubmitting(true);

    const startDateTime = new Date(`${date.toISOString().split("T")[0]}T${startTime}`);
    const endDateTime = new Date(`${date.toISOString().split("T")[0]}T${endTime}`);

    const appointmentData = {
      title,
      description,
      type, // ✅ include type
      color: typeColors[type], // ✅ store color for easy styling
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString()
    };

    if (appointmentToEdit) {
      await updateAppointment(appointmentToEdit.id, appointmentData);
    } else {
      await createAppointment(appointmentData);
    }

    onAdd();
    onClose();
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{appointmentToEdit ? "Edit Appointment" : "Create Appointment"}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Appointment title"
              required
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
              required
            />
            {error.description && <span className="error-text">{error.description}</span>}
          </div>

          {/* Appointment Type */}
          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ borderLeft: `10px solid ${typeColors[type]}` }} // ✅ show color in dropdown
              required
            >
              {Object.keys(typeColors).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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
                  if (!isNaN(newDate)) setDate(newDate);
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
              required
            >
              <option value="">Select start time</option>
              {generateTimeOptions().map(timeOption => (
                <option key={timeOption} value={timeOption}>
                  {formatTimeForDisplay(timeOption)}
                </option>
              ))}
            </select>
          </div>

          {/* End Time */}
          <div className="form-group">
            <label htmlFor="endTime">End Time *</label>
            <select
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            >
              <option value="">Select end time</option>
              {generateTimeOptions().map(timeOption => (
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
              disabled={isSubmitting || Object.keys(error).length > 0}
              style={{ backgroundColor: typeColors[type] }} // ✅ button color matches type
            >
              {isSubmitting ? "Saving..." : appointmentToEdit ? "Update" : "Create"}
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

// Format time for dropdown
const formatTimeForDisplay = (time) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export default AddAppointmentModal;
