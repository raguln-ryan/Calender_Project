import React, { createContext, useState, useEffect } from "react";
import { getAppointments } from "../services/api";

export const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchAppointments = async () => {
    try {
      const date = selectedDate.toISOString().split("T")[0];
      const res = await getAppointments(date);
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  return (
    <AppointmentContext.Provider
      value={{ appointments, fetchAppointments, selectedDate, setSelectedDate }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};