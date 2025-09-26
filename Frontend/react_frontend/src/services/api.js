import axios from "axios";
import { toast } from 'react-toastify';

// Create Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend URL
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log("Token attached:", token); // debug
    } else {
      console.log("No token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper: make API requests safely
// Helper: make API requests safely
const handleRequest = async (request) => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    console.error("API Error:", error);

    if (error.response) {
      // Backend responded with error status
      // Read multiple possible keys for error messages
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        error.response.statusText ||
        "An error occurred";
      // Include status code in error object for frontend checks
      const err = new Error(message);
      err.status = error.response.status;
      throw err;
    } else if (error.request) {
      throw new Error("No response from server. Check backend or CORS.");
    } else {
      throw new Error(error.message);
    }
  }
};


// ------------------ Auth APIs ------------------
export const loginUser = async ({ username, password }) =>
  handleRequest(() => api.post("/users/login", { username, password }));

export const registerUser = async ({ username, password }) =>
  handleRequest(() => api.post("/users/register", { username, password }));

// ------------------ Appointment APIs ------------------
export const createAppointment = async (data) =>
  handleRequest(() => api.post("/appointments", data));

export const getAppointmentsByDate = async (date) =>
  handleRequest(() => api.get(`/appointments?date=${date}`));

export const getUpcomingAppointments = async (days = 7, start = new Date(), endDateParams = new Date()) => {
  const today = new Date(start).toISOString().split("T")[0];
  const endDate = new Date(endDateParams);
  endDate.setDate(endDate.getDate() + days);
  const end = endDate.toISOString().split("T")[0];
  return handleRequest(() => api.get(`/appointments/upcoming?start=${today}&end=${end}`));
};

export const updateAppointment = async (id, data) =>
  handleRequest(() => api.put(`/appointments/${id}`, data));

export const deleteAppointment = async (id) =>
  handleRequest(() => api.delete(`/appointments/${id}`));
