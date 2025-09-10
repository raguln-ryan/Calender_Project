import React from "react";
import AppointmentCard from "./AppointmentCard";
import "./TimeSlotGrid.css";

// 24 hours (0 → 23)
const hours = Array.from({ length: 24 }, (_, i) => i);

const TimeSlotGrid = ({ appointments }) => {
  return (
    <div className="grid-container">
      {hours.map((hour) => (
        <div key={hour} className="time-slot">
          <div className="time-label">
            {hour.toString().padStart(2, "0")}:00
          </div>
          <div className="slot">
            {appointments
              .filter(
                (a) => new Date(a.startTime).getHours() === hour
              )
              .map((a) => (
                <AppointmentCard key={a.id} appointment={a} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimeSlotGrid;
