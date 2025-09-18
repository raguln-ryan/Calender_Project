import React, { useState, useEffect } from "react";
import {
  getAppointments,
  getUpcomingAppointments,
  updateAppointment,
} from "../services/api";
import TimeSlotGrid from "../components/TimeSlotGrid";
import AddAppointmentModal from "../components/AddAppointmentModal";
import UpcomingAppointments from "../components/UpcomingAppointments";
import ThemeToggle from "../components/ThemeToggle";
import CalendarViewSelector from "../components/CalendarViewSelector";
import "./CalendarPage.css";
import moment from "moment";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [calendarView, setCalendarView] = useState("day");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [popupMessage, setPopupMessage] = useState(""); // popup message

  // Auto-hide popup after 3 seconds
  useEffect(() => {
    if (popupMessage) {
      const timer = setTimeout(() => setPopupMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [popupMessage]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setSelectedDate((prev) =>
            e.shiftKey
              ? moment(prev).subtract(1, "week").toDate()
              : moment(prev).subtract(1, "day").toDate()
          );
          break;
        case "ArrowRight":
          e.preventDefault();
          setSelectedDate((prev) =>
            e.shiftKey
              ? moment(prev).add(1, "week").toDate()
              : moment(prev).add(1, "day").toDate()
          );
          break;
        case "d":
        case "D":
          setCalendarView("day");
          break;
        case "w":
        case "W":
          setCalendarView("week");
          break;
        case "m":
        case "M":
          setCalendarView("month");
          break;
        case "n":
        case "N":
          setSelectedAppointment(null);
          setSelectedTimeSlot(null);
          setShowModal(true);
          break;
        case "Escape":
          if (showModal) setShowModal(false);
          if (showUpcoming) setShowUpcoming(false);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal, showUpcoming]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAppointments(
        moment(selectedDate).format("YYYY-MM-DD")
      );
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const data = await getUpcomingAppointments();
      setUpcomingAppointments(data);
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
    }
  };

  const handleSlotClick = (timeSlot, appointment) => {
    if (appointment) setSelectedAppointment(appointment);
    else {
      setSelectedTimeSlot(timeSlot);
      setSelectedAppointment(null);
    }
    setShowModal(true);
  };

  const handleDateChange = (date) => setSelectedDate(date);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTimeSlot(null);
    setSelectedAppointment(null);
  };

  const handleAppointmentAdded = (newAppointment, isEdit = false) => {
    setAppointments((prev) => {
      if (isEdit) {
        return prev.map((app) =>
          app.id === newAppointment.id ? newAppointment : app
        );
      } else {
        return [...prev, newAppointment];
      }
    });
    fetchUpcomingAppointments();
    handleCloseModal();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  const handleViewChange = (view) => setCalendarView(view);

  const goToPreviousDay = () =>
    setSelectedDate((prev) => moment(prev).subtract(1, "day").toDate());

  const goToNextDay = () =>
    setSelectedDate((prev) => moment(prev).add(1, "day").toDate());

  const handleEditUpcoming = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedTimeSlot(null);
    setShowModal(true);
  };

  const filteredAppointments = appointments.filter(
    (a) =>
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Move appointment instantly (called by TimeSlotGrid on drop)
  const handleMoveAppointment = async (appointmentId, newDate, newTime) => {
    try {
      const appointmentIndex = appointments.findIndex(
        (a) => a.id === parseInt(appointmentId)
      );
      if (appointmentIndex === -1) return;

      const appointment = appointments[appointmentIndex];
      const duration =
        new Date(appointment.endTime) - new Date(appointment.startTime);
      const [hours, minutes] = newTime.split(":");
      const newStart = new Date(newDate);
      newStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const newEnd = new Date(newStart.getTime() + duration);

      const updatedAppointment = {
        ...appointment,
        startTime: newStart.toISOString(),
        endTime: newEnd.toISOString(),
      };

      await updateAppointment(appointment.id, updatedAppointment);

      // Update state locally so all views reflect change immediately
      const newAppointments = [...appointments];
      newAppointments[appointmentIndex] = updatedAppointment;
      setAppointments(newAppointments);

      fetchUpcomingAppointments();
      setPopupMessage("Appointment moved successfully!");
    } catch (error) {
      console.error("Failed to move appointment:", error);
      setPopupMessage("Could not move appointment. Conflict exists!");
    }
  };

  return (
    <div className={`calendar-container ${darkMode ? "dark-mode" : ""}`}>
      {/* Popup message */}
      {popupMessage && (
        <div className="popup-message">
          {popupMessage}
          <button
            className="close-popup"
            onClick={() => setPopupMessage("")}
          >
            ✖
          </button>
        </div>
      )}

      <div className="calendar-layout">
        {/* ✅ Sidebar + overlay for mobile */}
        {isMobile && showUpcoming && (
          <div
            className="overlay"
            onClick={() => setShowUpcoming(false)}
          ></div>
        )}

        <div className={`upcoming-sidebar ${showUpcoming ? "open" : ""}`}>
          <UpcomingAppointments
            appointments={upcomingAppointments}
            onEdit={handleEditUpcoming}
          />
        </div>

        <div className="calendar-main">
          <header className="calendar-header">
            {/* ✅ Hamburger only on mobile */}
            {isMobile && (
              <button
                className="hamburger-btn"
                onClick={() => setShowUpcoming(true)}
              >
                ☰
              </button>
            )}

            {!isMobile && (
              <button
                className="toggle-upcoming-btn"
                onClick={() => setShowUpcoming(!showUpcoming)}
              >
                <span style={{ fontSize: "1.2rem", marginRight: "6px" }}>
                  📌
                </span>
                {showUpcoming
                  ? "Hide Upcoming Appointments"
                  : "Show Upcoming Appointments"}
              </button>
            )}

            <div className="center-section">
              <h1>Appointment Calendar</h1>
              <div className="date-navigation">
                <button onClick={goToPreviousDay}>&lt;</button>
                <span>{moment(selectedDate).format("YYYY-MM-DD")}</span>
                <button onClick={goToNextDay}>&gt;</button>
              </div>
            </div>

            <div className="right-section">
              <ThemeToggle
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
              <button
                className="add-appointment-btn"
                onClick={() => {
                  setSelectedAppointment(null);
                  setSelectedTimeSlot(null);
                  setShowModal(true);
                }}
              >
                <span className="plus-icon">+</span>
                <span className="btn-text">Add Appointment</span>
              </button>
            </div>
          </header>

          <div className="calendar-controls">
            <div className="date-selector">
              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={(e) => handleDateChange(new Date(e.target.value))}
              />
            </div>
            <CalendarViewSelector
              currentView={calendarView}
              onViewChange={handleViewChange}
            />
          </div>

          {loading ? (
            <div className="loading-container">
              <p>Loading appointments...</p>
            </div>
          ) : (
            <TimeSlotGrid
              appointments={filteredAppointments}
              selectedDate={selectedDate}
              onSlotClick={handleSlotClick}
              view={calendarView}
              onMoveAppointment={handleMoveAppointment}
            />
          )}
        </div>
      </div>

      {showModal && (
        <AddAppointmentModal
          onClose={handleCloseModal}
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          onAdd={handleAppointmentAdded}
          appointmentToEdit={selectedAppointment}
          setPopupMessage={setPopupMessage}
        />
      )}
    </div>
  );
};

export default CalendarPage;
