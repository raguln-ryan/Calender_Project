import React, { useState, useEffect } from "react";
import { createAppointment, updateAppointment } from "../services/api";
import "./AddAppointmentModal.css";

const AddAppointmentModal = ({ 
  onClose, 
  selectedDate, 
  selectedTimeSlot, 
  onAdd, 
  appointmentToEdit 
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("other"); // Default type
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with appointment data if editing
  useEffect(() => {
    if (appointmentToEdit) {
      setTitle(appointmentToEdit.title || "");
      setDescription(appointmentToEdit.description || "");
      setTime(appointmentToEdit.time || "");
      setType(appointmentToEdit.type || "other");
    } else if (selectedTimeSlot) {
      setTime(selectedTimeSlot);
    }
  }, [appointmentToEdit, selectedTimeSlot]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    
    if (!time) {
      setError("Time is required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      const appointmentData = {
        title,
        description,
        date: selectedDate.toISOString().split("T")[0],
        time,
        type
      };
      
      if (appointmentToEdit) {
        // Update existing appointment
        await updateAppointment(appointmentToEdit.id, appointmentData);
      } else {
        // Create new appointment
        await createAppointment(appointmentData);
      }
      
      // Call onAdd to refresh appointments
      onAdd();
      
      // Show success message or notification
      alert(`Appointment ${appointmentToEdit ? 'updated' : 'created'} successfully!`);
      
    } catch (error) {
      console.error("Error saving appointment:", error);
      setError("Failed to save appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{appointmentToEdit ? "Edit Appointment" : "Add Appointment"}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Appointment title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this appointment"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={selectedDate.toISOString().split("T")[0]}
              disabled
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="time">Time</label>
            <select
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            >
              <option value="">Select a time</option>
              {generateTimeOptions().map((timeOption) => (
                <option key={timeOption} value={timeOption}>
                  {formatTimeForDisplay(timeOption)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="type">Appointment Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="medical">Medical</option>
              <option value="other">Other</option>
            </select>
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
              className="save-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : (appointmentToEdit ? "Update" : "Save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper function to generate time options for the select dropdown
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour <= 23; hour++) {
    const formattedHour = hour.toString().padStart(2, '0');
    options.push(`${formattedHour}:00`);
    options.push(`${formattedHour}:30`);
  }
  return options;
};

// Helper function to format time for display
const formatTimeForDisplay = (time) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${displayHour}:${minutes} ${ampm}`;
};

export default AddAppointmentModal;
