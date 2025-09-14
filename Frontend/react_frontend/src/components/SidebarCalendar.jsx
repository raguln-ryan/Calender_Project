import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./SidebarCalendar.css";

const SidebarCalendar = ({ selectedDate, onDateChange }) => {
  return (
    <div className="sidebar-calendar">
      <Calendar
        value={selectedDate}
        onChange={onDateChange}
        calendarType="US" // week starts on Sunday
      />
    </div>
  );
};

export default SidebarCalendar;
