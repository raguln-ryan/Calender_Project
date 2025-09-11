import React from "react";
import AppointmentCard from "./AppointmentCard";
import "./WeekView.css";

const WeekView = ({ appointments, selectedDate, setAppointments }) => {
  // Find start of the week (Sunday)
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

  // Generate days of the week
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  // Generate 30-minute slots (48 slots for 24 hours)
  const slots = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? "00" : "30";
    return `${h.toString().padStart(2, "0")}:${m}`;
  });

  const onDrop = (e, day, slot) => {
    const id = e.dataTransfer.getData("appointmentId");
    setAppointments((prev) =>
      prev.map((app) =>
        app.id.toString() === id
          ? {
              ...app,
              start: new Date(
                `${day.toISOString().split("T")[0]}T${slot}`
              ).toISOString(),
            }
          : app
      )
    );
  };

  return (
    <div className="week-view">
      {/* Header row */}
      <div className="week-header">
        <div className="time-col"></div>
        {days.map((day, i) => (
          <div key={i} className="day-col-header">
            {day.toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
            })}
          </div>
        ))}
      </div>

      {/* Time slots grid */}
      <div className="week-grid">
        {slots.map((slot, i) => (
          <div key={i} className="week-row">
            <div className="time-col">{slot}</div>
            {days.map((day, j) => (
              <div
                key={j}
                className="week-slot"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, day, slot)}
              >
                {appointments
                  .filter(
                    (app) =>
                      new Date(app.start).toDateString() ===
                        day.toDateString() &&
                      new Date(app.start).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) ===
                        new Date(
                          `${day.toISOString().split("T")[0]}T${slot}`
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                  )
                  .map((app) => (
                    <AppointmentCard
                      key={app.id}
                      appointment={app}
                      draggableProps={{
                        onDragStart: (e) =>
                          e.dataTransfer.setData(
                            "appointmentId",
                            app.id.toString()
                          ),
                      }}
                    />
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
