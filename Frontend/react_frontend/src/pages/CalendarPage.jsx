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
      <DateNavigator
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <TimeSlotGrid appointments={appointments} />

      {/* Floating + Button */}
      <button className="add-btn" onClick={() => setShowModal(true)}>
        +
      </button>

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
