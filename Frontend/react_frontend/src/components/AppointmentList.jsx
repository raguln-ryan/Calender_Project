import React, { useContext } from "react";
import { AppointmentContext } from "../context/AppointmentContext";
import AppointmentCard from "./AppointmentCard";
import { deleteAppointment } from "../services/api";

const AppointmentList = () => {
  const { appointments, fetchAppointments } = useContext(AppointmentContext);

  const handleDelete = async (id) => {
    await deleteAppointment(id);
    fetchAppointments();
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Appointments</h3>
      {appointments.length === 0 ? (
        <p>No appointments for this day.</p>
      ) : (
        appointments.map((appt) => (
          <AppointmentCard
            key={appt.id}
            appointment={appt}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
};

export default AppointmentList;
