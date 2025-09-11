import React from "react";
import "./DateNavigator.css";

const DateNavigator = ({ selectedDate, setSelectedDate }) => {
  const changeDay = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    setSelectedDate(newDate);
  };

  return (
    <div className="date-nav">
      <button onClick={() => changeDay(-1)}>←</button>
      <h2>{selectedDate.toDateString()}</h2>
      <button onClick={() => changeDay(1)}>→</button>
    </div>
  );
};

export default DateNavigator;