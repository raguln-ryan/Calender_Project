// src/MyFrontend.Tests/pages/CalendarPage.test.jsx
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import CalendarPage from "../../pages/CalendarPage";
import * as api from "../../services/api";
import moment from "moment";

jest.mock("../../services/api");
jest.mock("../../components/AddAppointmentModal", () => ({ onClose, selectedDate, onAdd, appointmentToEdit }) => (
  <div data-testid="modal">
    <button onClick={() => onAdd({ id: 999, title: "Test" })}>Add</button>
    <button onClick={onClose}>Close</button>
  </div>
));
jest.mock("../../components/UpcomingAppointments", () => ({ appointments, onEdit }) => (
  <div>
    {appointments.map((a) => (
      <div key={a.id} onClick={() => onEdit(a)}>{a.title}</div>
    ))}
  </div>
));
jest.mock("../../components/TimeSlotGrid", () => ({ appointments, onSlotClick }) => (
  <div>
    {appointments.map((a) => (
      <div key={a.id} onClick={() => onSlotClick(a)}>{a.title}</div>
    ))}
  </div>
));
jest.mock("../../components/ThemeToggle", () => ({ darkMode, toggleDarkMode }) => (
  <button onClick={toggleDarkMode}>{darkMode ? "🌙" : "☀️"}</button>
));
jest.mock("../../components/CalendarViewSelector", () => ({ currentView, onViewChange }) => (
  <div>
    <button onClick={() => onViewChange("day")}>Day</button>
    <button onClick={() => onViewChange("week")}>Week</button>
    <button onClick={() => onViewChange("month")}>Month</button>
  </div>
));

describe("CalendarPage Full Coverage", () => {
  const setIsAuthenticated = jest.fn();

  const mockAppointments = [
    { id: 1, title: "Meeting", startTime: "2025-09-25T09:00:00.000Z", endTime: "2025-09-25T10:00:00.000Z" },
    { id: 2, title: "Call", startTime: "2025-09-25T11:00:00.000Z", endTime: "2025-09-25T11:30:00.000Z" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    api.getUpcomingAppointments.mockResolvedValue(mockAppointments);
    api.updateAppointment.mockResolvedValue({});
  });

  test("renders CalendarPage with appointments", async () => {
    await act(async () => {
      render(<CalendarPage setIsAuthenticated={setIsAuthenticated} />);
    });
    expect(screen.getByText(/Meeting/i)).toBeInTheDocument();
    expect(screen.getByText(/Call/i)).toBeInTheDocument();
  });

  test("opens and closes AddAppointmentModal", async () => {
    await act(async () => render(<CalendarPage setIsAuthenticated={setIsAuthenticated} />));
    fireEvent.click(screen.getByText(/\+ Add Appointment/i));
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Close"));
    expect(screen.queryByTestId("modal")).toBeNull();
  });

  test("adds appointment via modal", async () => {
    await act(async () => render(<CalendarPage setIsAuthenticated={setIsAuthenticated} />));
    fireEvent.click(screen.getByText(/\+ Add Appointment/i));
    fireEvent.click(screen.getByText("Add"));
    expect(await screen.findByText("Test")).toBeInTheDocument();
  });

  test("edit upcoming appointment opens modal", async () => {
    await act(async () => render(<CalendarPage setIsAuthenticated={setIsAuthenticated} />));
    fireEvent.click(screen.getByText("Meeting"));
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  test("keyboard shortcuts: arrowleft, arrowright, t, n, u, d, w, m, escape", async () => {
    await act(async () => render(<CalendarPage setIsAuthenticated={setIsAuthenticated} />));
    const initialDate = new Date();
    // Arrow left
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    // 't' resets date
    fireEvent.keyDown(window, { key: "t" });
    // 'n' opens modal
    fireEvent.keyDown(window, { key: "n" });
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    // 'u' toggles upcoming
    fireEvent.keyDown(window, { key: "u" });
    // 'd' toggles dark mode
    fireEvent.keyDown(window, { key: "d" });
    // 'w' and 'm' change view
    fireEvent.keyDown(window, { key: "w" });
    fireEvent.keyDown(window, { key: "m" });
    // escape closes modal
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByTestId("modal")).toBeNull();
  });

  test("changes calendar view via buttons", async () => {
    await act(async () => render(<CalendarPage setIsAuthenticated={setIsAuthenticated} />));
    fireEvent.click(screen.getByText("Week"));
    fireEvent.click(screen.getByText("Month"));
    fireEvent.click(screen.getByText("Day"));
  });

  test("toggles dark mode via ThemeToggle", async () => {
    await act(async () => render(<CalendarPage setIsAuthenticated={setIsAuthenticated} />));
    const toggleBtn = screen.getByText("☀️");
    fireEvent.click(toggleBtn);
    expect(document.body.classList.contains("dark-mode")).toBe(true);
  });

  test("logout clears token and navigates", async () => {
    localStorage.setItem("token", "123");
    await act(async () => render(<CalendarPage setIsAuthenticated={setIsAuthenticated} />));
    fireEvent.click(screen.getByText(/Logout/i));
    expect(setIsAuthenticated).toHaveBeenCalledWith(false);
    expect(localStorage.getItem("token")).toBeNull();
  });

  test("move appointment handles conflict error", async () => {
    api.updateAppointment.mockRejectedValue({ status: 409, message: "Conflict" });
    await act(async () => render(<CalendarPage setIsAuthenticated={setIsAuthenticated} />));
    const calendar = screen.getByText("Meeting");
    await act(async () => screen.getByText("Meeting") && fireEvent.click(calendar));
    // Simulate move
    await act(async () => screen.getByText("Meeting") && fireEvent.dragStart(calendar) && fireEvent.drop(calendar));
    expect(screen.getByText(/Conflict! This time slot is already booked/i)).toBeInTheDocument();
  });

});
