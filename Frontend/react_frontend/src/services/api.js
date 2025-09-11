import axios from "axios";

const API_URL = "http://localhost:5000/api/appointments"; 
// or https://localhost:5001/api/appointments depending on your backend

export const getAppointments = (date) =>
  axios.get(`${API_URL}?date=${date}`);

export const createAppointment = (appointment) =>
  axios.post(API_URL, appointment, {
    headers: { "Content-Type": "application/json" }
  });

export const deleteAppointment = (id) =>
  axios.delete(`${API_URL}/${id}`);