import React, { useState, useEffect } from "react";
import { getUpcomingAppointments, deleteAppointment } from "../services/api";
import "./UpcomingAppointments.css";

const UpcomingAppointments = ({ refreshTrigger, onEdit, onDelete }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getUpcomingAppointments(30); // fetch next 30 days
      const upcoming = data?.filter((a) => !a.completed) || [];
      setAppointments(upcoming);
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

  // 🔹 Only filter when a date is selected
  const filteredAppointments =
    selectedDate && appointments.length
      ? appointments.filter((a) => {
          const title = a?.title?.toLowerCase() || "";
          const type = a?.type?.toLowerCase() || "";
          const matchesSearch =
            title.includes(searchQuery.toLowerCase()) ||
            type.includes(searchQuery.toLowerCase());

          const appointmentDate = new Date(a.startTime);
          const selected = new Date(selectedDate);

          const matchesDate =
            appointmentDate.getFullYear() === selected.getFullYear() &&
            appointmentDate.getMonth() === selected.getMonth() &&
            appointmentDate.getDate() === selected.getDate();

          return matchesSearch && matchesDate;
        })
      : [];

  return (
    <div className="upcoming-appointments">
      <h3>📅 Upcoming Appointments</h3>

      {/* 🔹 Date picker + search bar */}
      <div className="search-container">
        <div className="date-picker-input">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          {selectedDate && (
            <button
              className="clear-date-btn"
              onClick={() => setSelectedDate("")}
            >
              ✖
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Search appointments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : !selectedDate ? (
        <p>Please select a date to view appointments.</p>
      ) : filteredAppointments.length === 0 ? (
        <p>No appointments found for the selected date.</p>
      ) : (
        <ul className="appointments-list">
          {filteredAppointments.map((a) => (
            <li
              key={a.id}
              className="appointment-card"
              style={{
                backgroundColor: a.color || "#3f51b5",
                borderLeft: `8px solid ${a.color || "#3f51b5"}`
              }}
            >
              <div className="appointment-info">
                <strong className="appointment-title">{a.title}</strong> <br />
                <span className="type-badge">{a.type || "General"}</span> <br />
                <span className="appointment-time">
                  {new Date(a.startTime).toLocaleString()} –{" "}
                  {new Date(a.endTime).toLocaleTimeString()}
                </span>
              </div>

              <div className="actions below">
                <button
                  className="edit-btn"
                  onClick={() => onEdit && onEdit(a)}
                >
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
