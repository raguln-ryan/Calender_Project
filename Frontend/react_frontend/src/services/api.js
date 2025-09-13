import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Adjust to your API URL

// Create a new appointment
export const createAppointment = async (appointmentData) => {
  const response = await axios.post(`${API_URL}/appointments`, appointmentData);
  return response.data;
};

// Get all appointments
export const getAppointments = async () => {
  const response = await axios.get(`${API_URL}/appointments`);
  return response.data;
};

// Get appointments for a specific date
export const getAppointmentsByDate = async (date) => {
  const response = await axios.get(`${API_URL}/appointments/date/${date}`);
  return response.data;
};

// Update an existing appointment
export const updateAppointment = async (id, appointmentData) => {
  const response = await axios.put(`${API_URL}/appointments/${id}`, appointmentData);
  return response.data;
};

// Delete an appointment
export const deleteAppointment = async (id) => {
  const response = await axios.delete(`${API_URL}/appointments/${id}`);
  return response.data;
};
