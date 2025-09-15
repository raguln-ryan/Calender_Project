import React from "react";
import "./SmallCalendar.css"; // Add styles

const SmallCalendar = ({ selectedDate, onDateChange }) => {
  const today = new Date();

  // Generate dates for the current month
  const getDatesForMonth = (year, month) => {
    const dates = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      dates.push(new Date(year, month, d));
    }
    return dates;
  };

  const monthDates = getDatesForMonth(selectedDate.getFullYear(), selectedDate.getMonth());

  return (
    <div className="small-calendar-container">
      <div className="month-label">
        {selectedDate.toLocaleString("default", { month: "long" })} {selectedDate.getFullYear()}
      </div>
      <div className="dates-grid">
        {monthDates.map((date) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === today.toDateString();
          return (
            <div
              key={date.toISOString()}
              className={`calendar-date ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
              onClick={() => onDateChange(date)}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SmallCalendar;
