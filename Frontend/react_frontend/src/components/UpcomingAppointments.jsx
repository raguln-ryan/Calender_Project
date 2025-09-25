import React, { useState, useEffect } from "react";
import { getUpcomingAppointments, deleteAppointment } from "../services/api";
import "../styles/UpcomingAppointments.css";

const UpcomingAppointments = ({ refreshTrigger, onEdit, onDelete }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Helper: normalize dates to local midnight
  const normalizeDate = (d) => {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd.getTime();
  };

  // Fetch upcoming appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getUpcomingAppointments(30); // next 30 days
      const now = new Date();
      now.setHours(0, 0, 0, 0); // start of today

      const upcoming = (data || []).filter((a) => {
        const startTime = new Date(a.startTime);
        return !a.completed && startTime >= now;
      });

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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

// Filter appointments
const filteredAppointments = appointments
  .filter((a) => {
    const title = a?.title?.toLowerCase() || "";
    const type = a?.type?.toLowerCase() || "";
    const matchesSearch =
      title.includes(searchQuery.toLowerCase()) ||
      type.includes(searchQuery.toLowerCase());

    if (!selectedDate) return matchesSearch;

    const appointmentDate = new Date(a.startTime);
    const selected = new Date(selectedDate);

    return (
      matchesSearch &&
      normalizeDate(appointmentDate) === normalizeDate(selected)
    );
  })
  // ✅ sort by date then by time
  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));


  const isTablet = windowWidth >= 768 && windowWidth <= 1280;
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <>
      {/* Hamburger button */}
      {!isOpen && (
        <button className="hamburger-btn" onClick={() => setIsOpen(true)}>
          ☰
        </button>
      )}

      {isTablet && !isOpen && (
        <button
          className="show-appointments-btn"
          onClick={() => setIsOpen(true)}
        >
          Show Upcoming Appointments
        </button>
      )}

      {/* Sidebar */}
      <div className={`upcoming-appointments ${isOpen ? "open" : ""}`}>
        <h3 className="section-title">📅 Upcoming Appointments</h3>

        {/* Sticky Header */}
        <div className="search-container sticky-header">
          <div className="date-picker-input">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={todayStr}
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

        {/* Scrollable list */}
        <div className="appointments-scroll with-header">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : filteredAppointments.length === 0 ? (
            <p>No upcoming appointments.</p>
          ) : (
            <ul className="appointments-list">
              {filteredAppointments.map((a) => (
                <li
                  key={a.id}
                  className="appointment-card"
                  style={{
                    backgroundColor: a.color || "#3f51b5",
                    borderLeft: `8px solid ${a.color || "#3f51b5"}`,
                  }}
                >
                  <div className="appointment-info">
                    <strong className="appointment-title">{a.title}</strong>
                    <br />
                    <span className="type-badge">{a.type || "General"}</span>
                    <br />
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
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="overlay show" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default UpcomingAppointments;
