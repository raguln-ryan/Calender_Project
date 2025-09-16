import React, { useState, useEffect } from "react";
import {
  getAppointments,
  getUpcomingAppointments,
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

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch appointments for selected date
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  // Fetch upcoming appointments
  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

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
    if (appointment) {
      setSelectedAppointment(appointment);
    } else {
      setSelectedTimeSlot(timeSlot);
      setSelectedAppointment(null);
    }
    setShowModal(true);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTimeSlot(null);
    setSelectedAppointment(null);
  };

  const handleAppointmentAdded = () => {
    fetchAppointments();
    fetchUpcomingAppointments();
    handleCloseModal();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  const handleViewChange = (view) => {
    setCalendarView(view);
  };

  const goToPreviousDay = () => {
    setSelectedDate((prev) => moment(prev).subtract(1, "day").toDate());
  };

  const goToNextDay = () => {
    setSelectedDate((prev) => moment(prev).add(1, "day").toDate());
  };

  return (
    <div className={`calendar-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="calendar-layout">
        {/* Collapsible Upcoming Sidebar */}
        <div className={`upcoming-sidebar ${showUpcoming ? "open" : ""}`}>
          <UpcomingAppointments appointments={upcomingAppointments} />
        </div>

        {/* Main Calendar Area */}
        <div className="calendar-main">
          <header className="calendar-header">
            {/* Toggle upcoming sidebar button */}
            <button
              className="toggle-upcoming-btn"
              onClick={() => setShowUpcoming(!showUpcoming)}
            >
              {showUpcoming
                ? "Hide Upcoming Appointments"
                : "Show Upcoming Appointments"}
            </button>

            {/* Center - Title & date navigation */}
            <div className="center-section">
              <h1>Appointment Calendar</h1>
              <div className="date-navigation">
                <button onClick={goToPreviousDay}>&lt;</button>
                <span>{moment(selectedDate).format("YYYY-MM-DD")}</span>
                <button onClick={goToNextDay}>&gt;</button>
              </div>
            </div>

            {/* Right - Controls */}
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

          {/* Calendar controls */}
          <div className="calendar-controls">
            <div className="date-selector">
              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={(e) =>
                  handleDateChange(new Date(e.target.value))
                }
              />
            </div>
            <CalendarViewSelector
              currentView={calendarView}
              onViewChange={handleViewChange}
            />
          </div>

          {/* Time slot grid */}
          {loading ? (
            <div className="loading-container">
              <p>Loading appointments...</p>
            </div>
          ) : (
            <TimeSlotGrid
              appointments={appointments}
              selectedDate={selectedDate}
              onSlotClick={handleSlotClick}
              view={calendarView}
            />
          )}
        </div>
      </div>

      {/* Add/Edit modal */}
      {showModal && (
        <AddAppointmentModal
          onClose={handleCloseModal}
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          onAdd={handleAppointmentAdded}
          appointmentToEdit={selectedAppointment}
        />
      )}
    </div>
  );
};

export default CalendarPage;
