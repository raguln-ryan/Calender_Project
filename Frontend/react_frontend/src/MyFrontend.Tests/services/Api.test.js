// src/MyFrontend.Tests/services/api.test.js
import * as api from "../../services/api";

describe("API service full coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock fetch globally
  const globalFetch = global.fetch;

  afterAll(() => {
    global.fetch = globalFetch;
  });

  test("loginUser - success", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ token: "123abc" }),
    });

    const response = await api.loginUser({ username: "user", password: "pass" });
    expect(response.token).toBe("123abc");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("loginUser - failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: "Invalid credentials",
    });

    await expect(api.loginUser({ username: "user", password: "wrong" }))
      .rejects.toThrow("Invalid credentials");
  });

  test("registerUser - success", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ message: "Registered" }),
    });

    const response = await api.registerUser({ username: "newuser", password: "pass" });
    expect(response.message).toBe("Registered");
  });

  test("registerUser - failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: "User exists",
    });

    await expect(api.registerUser({ username: "newuser", password: "pass" }))
      .rejects.toThrow("User exists");
  });

  test("getUpcomingAppointments - success", async () => {
    const data = [{ id: 1, title: "Meeting" }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(data),
    });

    const result = await api.getUpcomingAppointments();
    expect(result).toEqual(data);
  });

  test("getUpcomingAppointments - failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, statusText: "Error" });
    await expect(api.getUpcomingAppointments()).rejects.toThrow("Error");
  });

  test("updateAppointment - success", async () => {
    const updated = { id: 1, title: "Updated" };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(updated),
    });

    const result = await api.updateAppointment(1, { title: "Updated" });
    expect(result.title).toBe("Updated");
  });

  test("updateAppointment - failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, statusText: "Update failed" });
    await expect(api.updateAppointment(1, { title: "Updated" }))
      .rejects.toThrow("Update failed");
  });

  test("deleteAppointment - success", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: jest.fn() });
    await expect(api.deleteAppointment(1)).resolves.toBeTruthy();
  });

  test("deleteAppointment - failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, statusText: "Delete failed" });
    await expect(api.deleteAppointment(1)).rejects.toThrow("Delete failed");
  });
});
