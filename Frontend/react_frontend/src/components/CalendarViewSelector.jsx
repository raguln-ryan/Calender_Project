import React, { useState } from "react";

const CalendarViewSelector = ({ currentView, onViewChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const views = ["day", "week", "month", "year"];

  return (
    <div className="calendar-view-selector">
      <button onClick={() => setShowDropdown(!showDropdown)}>
        {currentView.charAt(0).toUpperCase() + currentView.slice(1)} ▾
      </button>
      {showDropdown && (
        <ul className="view-dropdown">
          {views.map((v) => (
            <li key={v} onClick={() => { onViewChange(v); setShowDropdown(false); }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CalendarViewSelector;
