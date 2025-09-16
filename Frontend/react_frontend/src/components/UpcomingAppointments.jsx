import React from "react";

const UpcomingAppointments = ({ appointments }) => {
  return (
    <div className="upcoming-appointments">
      <h3>Upcoming Appointments</h3>
      {appointments.length === 0 ? (
        <p>No upcoming appointments</p>
      ) : (
        <ul>
          {appointments.map((a) => (
            <li key={a.id}>
              <strong>{a.title}</strong> <br />
              {new Date(a.startTime).toLocaleString()} -{" "}
              {new Date(a.endTime).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UpcomingAppointments;
