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

  // Real-time validation
  useEffect(() => {
    const newErrors = {};

    // 1️⃣ Title validation: letters + basic punctuation only, max 50
    if (!title.trim()) {
      newErrors.title = "Title is required.";
    } else if (title.length > 50) {
      newErrors.title = "Title cannot exceed 50 characters.";
    } else if (!/^[a-zA-Z\s.,!?-]+$/.test(title)) {
      newErrors.title = "Title can only contain letters and punctuation.";
    }

    // 2️⃣ Description validation: letters, numbers, spaces, basic punctuation, max 100
    if (!description.trim()) {
      newErrors.description = "Description is required.";
    } else if (description.length > 100) {
      newErrors.description = "Description cannot exceed 100 characters.";
    } else if (!/^[a-zA-Z0-9\s.,!?-]+$/.test(description)) {
      newErrors.description = "Description can only contain letters, numbers, and punctuation.";
    }

    // 3️⃣ End time after start time
    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = "End time must be later than start time.";
    }

    setError(newErrors);
  }, [title, description, startTime, endTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If any validation error exists, prevent submission
    if (Object.keys(error).length > 0 || !title || !description || !startTime || !endTime) return;

    setIsSubmitting(true);

    const startDateTime = new Date(`${date.toISOString().split("T")[0]}T${startTime}`);
    const endDateTime = new Date(`${date.toISOString().split("T")[0]}T${endTime}`);

    const appointmentData = {
      title,
      description,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString()
    };

    // 4️⃣ Directly call API, any error will propagate to console (no try-catch)
    if (appointmentToEdit) {
      await updateAppointment(appointmentToEdit.id, appointmentData);
    } else {
      await createAppointment(appointmentData);
    }

    onAdd(); // refresh UI immediately
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
            >
              <option value="">Select start time</option>
              {generateTimeOptions().map(timeOption => (
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
