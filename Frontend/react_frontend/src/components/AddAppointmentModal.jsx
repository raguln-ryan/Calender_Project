import React, { useState, useEffect } from "react";
import { createAppointment, updateAppointment } from "../services/api";
import "../styles/AddAppointmentModal.css";

const AddAppointmentModal = ({
  onClose,
  selectedDate, // ✅ clicked date from week/month view
  onAdd,
  appointmentToEdit,
  setPopupMessage,
}) => {
  const [title, setTitle] = useState(""); //initializes the state with an empty string.
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState(selectedDate || new Date());
  const [type, setType] = useState("Meeting");
  const [error, setError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TITLE_LIMIT = 30;
  const DESCRIPTION_LIMIT = 50;

  const typeColors = {
    Meeting: "#4CAF50",
    Call: "#2196F3",
    Task: "#FF9800",
    Personal: "#9C27B0",
  };

  // ✅ Sync date if parent changes selectedDate (week/month click)
  useEffect(() => {
    if (selectedDate) {
      setDate(new Date(selectedDate));
    }
  }, [selectedDate]);

  // ✅ Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // ✅ Load data if editing existing appointment
  useEffect(() => {
    if (appointmentToEdit) {
      setTitle(appointmentToEdit.title || "");
      setDescription(appointmentToEdit.description || "");
      setStartTime(appointmentToEdit.startTime?.slice(11, 16) || "");
      setEndTime(appointmentToEdit.endTime?.slice(11, 16) || "");
      setDate(new Date(appointmentToEdit.startTime));
      setType(appointmentToEdit.type || "Meeting");
    }
  }, [appointmentToEdit]);

  // ✅ Validation
  useEffect(() => {
    const newErrors = {};
    if (title.trim()) {
      if (title.length > TITLE_LIMIT)
        newErrors.title = `Title cannot exceed ${TITLE_LIMIT} characters.`;
      else if (!/^[a-zA-Z\s.,!?-]+$/.test(title))
        newErrors.title = "Title can only contain letters and punctuation.";
    }
    if (description.trim()) {
      if (description.length > DESCRIPTION_LIMIT)
        newErrors.description = `Description cannot exceed ${DESCRIPTION_LIMIT} characters.`;
      else if (!/^[a-zA-Z0-9\s.,!?-]+$/.test(description))
        newErrors.description =
          "Description can only contain letters, numbers, and punctuation.";
    }
    if (startTime && endTime && startTime >= endTime)
      newErrors.endTime = "End time must be later than start time.";

    setError(newErrors);
  }, [title, description, startTime, endTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(error).length > 0 || !title || !startTime || !endTime)
      return;

    setIsSubmitting(true);

    // ✅ Ensure appointment is created on selectedDate
    const formattedDate = date.toISOString().split("T")[0];
    const startDateTime = new Date(`${formattedDate}T${startTime}`);
    const endDateTime = new Date(`${formattedDate}T${endTime}`);

    const appointmentData = {
      title,
      description,
      type,
      color: typeColors[type],
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    };

    try {
      let savedAppointment;
      if (appointmentToEdit) {
        savedAppointment = await updateAppointment(
          appointmentToEdit.id,
          appointmentData
        );
        setPopupMessage?.("Appointment updated successfully!");
      } else {
        savedAppointment = await createAppointment(appointmentData);
        setPopupMessage?.("Appointment created successfully!");
      }

      onAdd(savedAppointment, !!appointmentToEdit);
      onClose();
    } catch (err) {
      console.error("Error saving appointment:", err);
      if (err.response?.data?.message) {
        setPopupMessage?.(err.response.data.message);
      } else {
        setPopupMessage?.("Appointment conflict detected.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Get today for min date restriction
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{appointmentToEdit ? "Edit Appointment" : "Create Appointment"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
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
              maxLength={TITLE_LIMIT} // ✅ Block extra chars
            />
            <div className="char-counter">
              {title.length}/{TITLE_LIMIT}
            </div>
            {error.title && <span className="error-text">{error.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this appointment"
              rows="3"
              maxLength={DESCRIPTION_LIMIT} // ✅ Block extra chars
            />
            <div className="char-counter">
              {description.length}/{DESCRIPTION_LIMIT}
            </div>
            {error.description && (
              <span className="error-text">{error.description}</span>
            )}
          </div>

          {/* Type */}
          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ borderLeft: `10px solid ${typeColors[type]}` }}
            >
              {Object.keys(typeColors).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Date (auto-filled from selectedDate) */}
          <div className="form-group date-picker-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              value={date.toISOString().split("T")[0]}
              onChange={(e) => setDate(new Date(e.target.value))}
              min={today} // ✅ Prevent past dates
              required
            />
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
              {generateTimeOptions().map((t) => (
                <option key={t} value={t}>
                  {formatTimeForDisplay(t)}
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
              {generateTimeOptions().map((t) => (
                <option key={t} value={t}>
                  {formatTimeForDisplay(t)}
                </option>
              ))}
            </select>
            {error.endTime && <span className="error-text">{error.endTime}</span>}
          </div>

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
              style={{ backgroundColor: typeColors[type] }}
            >
              {isSubmitting
                ? "Saving..."
                : appointmentToEdit
                ? "Update"
                : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour <= 23; hour++) {
    options.push(`${hour.toString().padStart(2, "0")}:00`);
    options.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return options;
};

const formatTimeForDisplay = (time) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export default AddAppointmentModal;
