import React from "react";
import "./AppointmentListPanel.css";

const AppointmentListPanel = ({ appointments, onClose }) => {
  return (
    <div className="appointment-list">
      <div className="list-header">
        <h3>Upcoming</h3>
        {onClose && <button className="close-panel" onClick={onClose}>×</button>}
      </div>
      {appointments.length > 0 ? (
        appointments.map((appt, idx) => (
          <div key={idx} className="list-item">
            <div className="li-time">{appt.startTime}</div>
            <div>
              <div className="li-title">{appt.title}</div>
              <div className="li-desc">{appt.description}</div>
            </div>
          </div>
        ))
      ) : (
        <div className="empty">No appointments</div>
      )}
    </div>
  );
};

export default AppointmentListPanel;
