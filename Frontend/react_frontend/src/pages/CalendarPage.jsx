import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ import navigate
import { getUpcomingAppointments, updateAppointment } from "../services/api";
import TimeSlotGrid from "../components/TimeSlotGrid";
import AddAppointmentModal from "../components/AddAppointmentModal";
import UpcomingAppointments from "../components/UpcomingAppointments";
import ThemeToggle from "../components/ThemeToggle";
import CalendarViewSelector from "../components/CalendarViewSelector";
import "./CalendarPage.css";
import moment from "moment";

const CalendarPage = ({ setIsAuthenticated }) => { // ✅ receive from App.js
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [calendarView, setCalendarView] = useState("day");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [popupMessage, setPopupMessage] = useState("");

  const navigate = useNavigate(); // ✅ navigation hook

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/", { replace: true });
  };

  const isMobile = screenWidth < 600;
  const isTablet = screenWidth >= 600 && screenWidth < 1024;

  useEffect(() => {
    if (popupMessage) {
      const timer = setTimeout(() => setPopupMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [popupMessage]);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchUpcomingAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getUpcomingAppointments(30); // fetch next 30 days
      const filtered = data.filter(
        (a) =>
          moment(a.startTime).isSame(selectedDate, "day") ||
          moment(a.endTime).isSame(selectedDate, "day")
      );
      setAppointments(filtered);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const data = await getUpcomingAppointments(7); // next 7 days
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
    setAppointments((prev) =>
      isEdit
        ? prev.map((app) => (app.id === newAppointment.id ? newAppointment : app))
        : [...prev, newAppointment]
    );
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

  const goToToday = () => setSelectedDate(new Date());

  const handleEditUpcoming = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedTimeSlot(null);
    setShowModal(true);
  };

  const filteredAppointments = appointments.filter(
    (a) =>
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {popupMessage && (
        <div className="popup-message">
          {popupMessage}
          <button className="close-popup" onClick={() => setPopupMessage("")}>
            ✖
          </button>
        </div>
      )}

      <div
        className={`calendar-layout ${
          isMobile ? "mobile" : isTablet ? "tablet" : "desktop"
        }`}
      >
        {isMobile && showUpcoming && (
          <div className="overlay" onClick={() => setShowUpcoming(false)}></div>
        )}

        <div
          className={`upcoming-sidebar ${showUpcoming ? "open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <UpcomingAppointments
            appointments={upcomingAppointments}
            onEdit={handleEditUpcoming}
          />
        </div>

        <div className="calendar-main">
          <header className="calendar-header">
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
                <span style={{ fontSize: "1.2rem", marginRight: "6px" }}>📌</span>
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
                <button onClick={goToToday} style={{ marginLeft: "10px" }}>
                  Today
                </button>
              </div>
            </div>

            <div className="right-section">
              <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

              {/* ✅ Logout button */}
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>

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
