import React, { createContext, useContext, useState } from "react";

const AppointmentContext = createContext();

export function AppointmentProvider({ children }) {
  const [appointments, setAppointments] = useState([]);

  const addAppointment = (appointment) => {
    setAppointments((prev) => [
      ...prev,
      { ...appointment, id: Date.now() },
    ]);
  };

  const updateAppointment = (id, updatedData) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedData } : a))
    );
  };

  const deleteAppointment = (id) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AppointmentContext.Provider
      value={{ appointments, addAppointment, updateAppointment, deleteAppointment }}
    >
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointments() {
  return useContext(AppointmentContext);
}
