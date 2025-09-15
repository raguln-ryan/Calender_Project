import React from "react";

const UpcomingAppointments = ({ appointments, selectedDate }) => {
  const todayAppointments = appointments.filter(a =>
    new Date(a.startTime).toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="upcoming-appointments">
      <h3>Upcoming Events</h3>
      {todayAppointments.length === 0 ? (
        <p>No appointments</p>
      ) : (
        <ul>
          {todayAppointments.map(a => (
            <li key={a.id}>
              <strong>{a.title}</strong> ({new Date(a.startTime).toLocaleTimeString()} - {new Date(a.endTime).toLocaleTimeString()})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UpcomingAppointments;
