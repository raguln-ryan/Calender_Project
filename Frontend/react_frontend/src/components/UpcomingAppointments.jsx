import React, { useState, useEffect } from "react";
import { getUpcomingAppointments, deleteAppointment } from "../services/api";
import "./UpcomingAppointments.css";

const UpcomingAppointments = ({ refreshTrigger, onEdit, onDelete }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getUpcomingAppointments(3); // next 3 days
      setAppointments(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch upcoming appointments.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?"
    );
    if (!confirmDelete) return;

    try {
      await deleteAppointment(id);
      fetchAppointments();
      if (onDelete) onDelete();
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert("Failed to delete appointment. Please try again.");
    }
  };

  return (
    <div className="upcoming-appointments">
      <h3>Upcoming Appointments (Next 3 Days)</h3>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : appointments.length === 0 ? (
        <p>No upcoming appointments.</p>
      ) : (
        <ul>
          {appointments.map((a) => (
            <li
              key={a.id}
              className="appointment-card"
              style={{
                backgroundColor: a.color || "#3f51b5", // ✅ fallback if no color
                borderLeft: `8px solid ${a.color || "#3f51b5"}`
              }}
            >
              <div className="appointment-info">
                <strong>{a.title}</strong> <br />
                <span className="type-badge">{a.type || "General"}</span> <br />
                {new Date(a.startTime).toLocaleString()} –{" "}
                {new Date(a.endTime).toLocaleTimeString()}
              </div>

              {/* Buttons below the appointment */}
              <div className="actions below">
                <button className="edit-btn" onClick={() => onEdit && onEdit(a)}>
                  ✏️ Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(a.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UpcomingAppointments;
