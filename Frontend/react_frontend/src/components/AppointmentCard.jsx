import React from "react";
import "./AppointmentCard.css";

const AppointmentCard = ({ appointment }) => {
  return (
    <div className="appointment-card">
      <strong>{appointment.title}</strong>
      <p>{appointment.description}</p>
    </div>
  );
};

export default AppointmentCard;
