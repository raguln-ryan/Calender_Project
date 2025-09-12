
import React, { useState } from "react";
import { createAppointment } from "../services/api";
import "./AddAppointmentModal.css";

const AddAppointmentModal = ({ onClose, selectedDate, onAdd }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(
    selectedDate ? selectedDate.toISOString().split("T")[0] : ""
  );
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

 const handleSubmit = async (e) => {
  e.preventDefault();

  const newAppointment = {
    title,
    description,
    startTime: `${date}T${startTime}`,
    endTime: `${date}T${endTime}`,
  };

  try {
    await createAppointment(newAppointment);

    // ✅ Show success popup
    alert("✅ Appointment created successfully!");

    onAdd();   // refresh list
    onClose(); // close modal
  } catch (err) {
    console.error("Error creating appointment:", err);

    if (err.response) {
      if (err.response.status === 409) {
        alert(err.response.data.message || "❌ Appointment conflict detected!");
      } else {
        alert(`❌ Failed: ${err.response.status} ${err.response.statusText}`);
      }
    } else {
      alert("❌ Network error. Backend might be down.");
    }
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Appointment</h2>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label>Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />

          <label>End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAppointmentModal;
