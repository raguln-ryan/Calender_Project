import axios from "axios";

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
      console.log("Token attached:", token); // debug
    } else {
      console.log("No token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper: make API requests safely
const handleRequest = async (request) => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    console.error("API Error:", error);

    if (error.response) {
      // Backend responded with error status
      throw new Error(error.response.data?.message || error.response.statusText);
    } else if (error.request) {
      // Request sent but no response received
      throw new Error("No response from server. Check backend or CORS.");
    } else {
      // Other errors
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

export const getUpcomingAppointments = async (days = 7) => {
  const today = new Date().toISOString().split("T")[0];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  const end = endDate.toISOString().split("T")[0];
  return handleRequest(() => api.get(`/appointments/upcoming?start=${today}&end=${end}`));
};

export const updateAppointment = async (id, data) =>
  handleRequest(() => api.put(`/appointments/${id}`, data));

export const deleteAppointment = async (id) =>
  handleRequest(() => api.delete(`/appointments/${id}`));
