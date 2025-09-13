import React, { useState, useEffect } from "react";
import { getAppointments } from "../services/api";
import TimeSlotGrid from "../components/TimeSlotGrid";
import AddAppointmentModal from "../components/AddAppointmentModal";
import UpcomingAppointments from "../components/UpcomingAppointments";
import ThemeToggle from "../components/ThemeToggle";
import CalendarViewSelector from "../components/CalendarViewSelector";
import HamburgerMenu from "../components/HamburgerMenu";
import "./CalendarPage.css";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [calendarView, setCalendarView] = useState("day"); // "day", "week", or "month"
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch appointments when component mounts or when selectedDate changes
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]); // Add selectedDate as dependency to refresh when date changes

  // Function to fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAppointments();
      console.log("Fetched appointments:", data); // Debug log
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  // Handle clicking on a time slot
  const handleSlotClick = (timeSlot, appointment) => {
    if (appointment) {
      // If there's an appointment, set it for editing
      setSelectedAppointment(appointment);
    } else {
      // If no appointment, prepare to create a new one
      setSelectedTimeSlot(timeSlot);
      setSelectedAppointment(null);
    }
    setShowModal(true);
  };

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTimeSlot(null);
    setSelectedAppointment(null);
  };

  // Handle appointment added or updated
  const handleAppointmentAdded = () => {
    // Refresh appointments immediately
    fetchAppointments();
    handleCloseModal();
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Apply dark mode class to body
    document.body.classList.toggle('dark-mode');
  };

  // Change calendar view
  const handleViewChange = (view) => {
    setCalendarView(view);
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className={`calendar-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header section with title, add button, and theme toggle */}
      <header className="calendar-header">
        {isMobile && <HamburgerMenu isOpen={menuOpen} toggleMenu={toggleMenu} />}
        
        {/* Left section - Upcoming appointments (hidden in mobile when menu closed) */}
        <div className={`left-section ${isMobile && !menuOpen ? 'hidden' : ''}`}>
          <UpcomingAppointments appointments={appointments} />
        </div>
        
        {/* Center section - Title */}
        <div className="center-section">
          <h1>Appointment Calendar</h1>
        </div>
        
        {/* Right section - Add button and theme toggle */}
        <div className="right-section">
          <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
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
            onChange={(e) => handleDateChange(new Date(e.target.value))}
          />
        </div>
        
        <CalendarViewSelector 
          currentView={calendarView} 
          onViewChange={handleViewChange} 
        />
      </div>

      {/* Time slot grid with loading state */}
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

      {/* Add/Edit appointment modal */}
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
