// src/MyFrontend.Tests/services/api.test.jsx
import axios from "axios";
import * as apiService from "../../services/api";

jest.mock("axios");

describe("API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Auth APIs", () => {
    test("loginUser calls API and returns data", async () => {
      const mockData = { token: "123abc" };
      axios.post.mockResolvedValue({ data: mockData });

      const response = await apiService.loginUser({ username: "user", password: "pass" });
      expect(response).toEqual(mockData);
      expect(axios.post).toHaveBeenCalledWith("/users/login", { username: "user", password: "pass" });
    });

    test("registerUser calls API and returns data", async () => {
      const mockData = { message: "Registered" };
      axios.post.mockResolvedValue({ data: mockData });

      const response = await apiService.registerUser({ username: "user", password: "pass" });
      expect(response).toEqual(mockData);
      expect(axios.post).toHaveBeenCalledWith("/users/register", { username: "user", password: "pass" });
    });
  });

  describe("Appointment APIs", () => {
    test("createAppointment calls API and returns data", async () => {
      const mockData = { id: 1, title: "Meeting" };
      axios.post.mockResolvedValue({ data: mockData });

      const response = await apiService.createAppointment({ title: "Meeting" });
      expect(response).toEqual(mockData);
      expect(axios.post).toHaveBeenCalledWith("/appointments", { title: "Meeting" });
    });

    test("getAppointmentsByDate calls API and returns data", async () => {
      const mockData = [{ id: 1, title: "Meeting" }];
      axios.get.mockResolvedValue({ data: mockData });

      const response = await apiService.getAppointmentsByDate("2025-09-25");
      expect(response).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith("/appointments?date=2025-09-25");
    });

    test("getUpcomingAppointments calls API and returns data", async () => {
      const mockData = [{ id: 1, title: "Meeting" }];
      axios.get.mockResolvedValue({ data: mockData });

      const response = await apiService.getUpcomingAppointments(7);
      expect(response).toEqual(mockData);
      const today = new Date().toISOString().split("T")[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      const end = endDate.toISOString().split("T")[0];
      expect(axios.get).toHaveBeenCalledWith(`/appointments/upcoming?start=${today}&end=${end}`);
    });

    test("updateAppointment calls API and returns data", async () => {
      const mockData = { id: 1, title: "Updated" };
      axios.put.mockResolvedValue({ data: mockData });

      const response = await apiService.updateAppointment(1, { title: "Updated" });
      expect(response).toEqual(mockData);
      expect(axios.put).toHaveBeenCalledWith("/appointments/1", { title: "Updated" });
    });

    test("deleteAppointment calls API and returns data", async () => {
      const mockData = { message: "Deleted" };
      axios.delete.mockResolvedValue({ data: mockData });

      const response = await apiService.deleteAppointment(1);
      expect(response).toEqual(mockData);
      expect(axios.delete).toHaveBeenCalledWith("/appointments/1");
    });
  });

  describe("handleRequest error handling", () => {
    test("throws error with response message", async () => {
      axios.post.mockRejectedValue({
        response: { data: { message: "Conflict" }, status: 409 }
      });

      await expect(apiService.loginUser({ username: "x", password: "y" }))
        .rejects.toThrow("Conflict");
    });

    test("throws error if no response from server", async () => {
      axios.post.mockRejectedValue({ request: {} });

      await expect(apiService.loginUser({ username: "x", password: "y" }))
        .rejects.toThrow("No response from server. Check backend or CORS.");
    });

    test("throws generic error if other error", async () => {
      axios.post.mockRejectedValue({ message: "Something failed" });

      await expect(apiService.loginUser({ username: "x", password: "y" }))
        .rejects.toThrow("Something failed");
    });
  });
});
