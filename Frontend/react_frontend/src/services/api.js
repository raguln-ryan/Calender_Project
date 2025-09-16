import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Must match backend
  headers: { "Content-Type": "application/json" },
});

// Helper for safer requests
const handleRequest = async (request) => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    console.error("Axios error details:", error);
    console.error("Error response:", error.response); 
    throw new Error(
      error.response?.data?.message || "Network error. Please try again."
    );
  }
};

// API functions
export const createAppointment = async (data) =>
  handleRequest(() => api.post("/appointments", data));

export const getAppointments = async (date) =>
  handleRequest(() => api.get("/appointments?date=" + date));

export const getAppointmentsByDate = async (date) =>
  handleRequest(() => api.get(`/appointments/date/${date}`));

export const updateAppointment = async (id, data) =>
  handleRequest(() => api.put(`/appointments/${id}`, data));

export const deleteAppointment = async (id) =>
  handleRequest(() => api.delete(`/appointments/${id}`));

// ✅ New: Get upcoming appointments for next N days
export const getUpcomingAppointments = async (days = 3) => {
  const today = new Date().toISOString().split("T")[0];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  const end = endDate.toISOString().split("T")[0];

  return handleRequest(() => api.get(`/appointments/upcoming?start=${today}&end=${end}`));
};
