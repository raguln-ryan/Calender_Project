import React, { useState, useEffect } from "react";
import DateNavigator from "../components/DateNavigator";
import TimeSlotGrid from "../components/TimeSlotGrid";
import AddAppointmentModal from "../components/AddAppointmentModal";
import { getAppointments } from "../services/api";
import "./CalendarPage.css";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchAppointments = async () => {
    const dateString = selectedDate.toISOString().split("T")[0];
    const res = await getAppointments(dateString);
    setAppointments(res.data);
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  return (
    <div className="calendar-container">
      {/* 🔹 Header Section */}
      <div className="calendar-header">
        <div className="header-left">
          <DateNavigator
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </div>

        <h1 className="header-title">Appointment Calendar</h1>

        <div className="header-right">
          <button className="add-btn" onClick={() => setShowModal(true)}>
            + Add Appointment
          </button>
        </div>
      </div>

      {/* 🔹 Appointment Slots */}
      <TimeSlotGrid appointments={appointments} />

      {/* 🔹 Modal */}
      {showModal && (
        <AddAppointmentModal
          onClose={() => setShowModal(false)}
          selectedDate={selectedDate}
          onAdd={fetchAppointments}
        />
      )}
    </div>
  );
};

export default CalendarPage;
