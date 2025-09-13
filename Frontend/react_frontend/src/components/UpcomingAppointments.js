import React from 'react';
import './UpcomingAppointments.css';

const UpcomingAppointments = ({ appointments }) => {
  // Filter and sort appointments to get upcoming ones
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingAppointments = appointments
    .filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5); // Show only next 5 appointments
  
  return (
    <div className="upcoming-appointments">
      <h3>Upcoming Appointments</h3>
      {upcomingAppointments.length > 0 ? (
        <ul className="appointment-list">
          {upcomingAppointments.map((appointment) => {
            const appointmentDate = new Date(appointment.date);
            return (
              <li 
                key={appointment.id} 
                className={`appointment-item appointment-${appointment.type || 'other'}`}
              >
                <div className="appointment-date">
                  {appointmentDate.toLocaleDateString()}
                </div>
                <div className="appointment-time">
                  {appointment.time}
                </div>
                <div className="appointment-title">
                  {appointment.title}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="no-appointments">No upcoming appointments</p>
      )}
    </div>
  );
};

export default UpcomingAppointments;
