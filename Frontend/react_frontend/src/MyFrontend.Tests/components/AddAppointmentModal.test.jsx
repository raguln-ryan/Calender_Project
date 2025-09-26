// src/MyFrontend.Tests/components/AddAppointmentModal.full.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddAppointmentModal from "../../components/AddAppointmentModal";
import * as api from "../../services/api";

jest.mock("../../services/api");

describe("AddAppointmentModal Complete Coverage", () => {
  const onClose = jest.fn();
  const onAdd = jest.fn();
  const setPopupMessage = jest.fn();
  const selectedDate = new Date("2025-09-25T00:00:00Z");

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const renderModal = (props = {}) => {
    return render(
      <AddAppointmentModal
        onClose={onClose}
        onAdd={onAdd}
        selectedDate={selectedDate}
        appointmentToEdit={null}
        setPopupMessage={setPopupMessage}
        {...props}
      />
    );
  };

  // Basic rendering tests
  test("renders modal in create mode", () => {
    renderModal();
    expect(screen.getByText(/Add Appointment/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
  });

  test("renders modal in edit mode with pre-filled data", () => {
    const appointment = {
      id: 1,
      title: "Meeting",
      type: "Call",
      color: "#FF5733",
      startTime: "2025-09-25T10:00:00Z",
      endTime: "2025-09-25T11:00:00Z",
      description: "Test description"
    };
    renderModal({ appointmentToEdit: appointment });
    expect(screen.getByText(/Edit Appointment/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Meeting")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Call")).toBeInTheDocument();
    expect(screen.getByDisplayValue("#FF5733")).toBeInTheDocument();
  });

  // Validation tests
  test("shows all validation errors simultaneously", async () => {
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));
    expect(await screen.findByText(/Title is required/i)).toBeInTheDocument();
  });

  test("validates title with whitespace only", async () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));
    expect(await screen.findByText(/Title is required/i)).toBeInTheDocument();
  });

  test("validates title max length", async () => {
    renderModal();
    const longTitle = "a".repeat(256);
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: longTitle } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));
    expect(await screen.findByText(/Title must be less than 255 characters/i)).toBeInTheDocument();
  });

  test("validates same start and end time", async () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: "10:00" } });
    fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: "10:00" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));
    expect(await screen.findByText(/End time must be after start time/i)).toBeInTheDocument();
  });

  test("validates end time before start time", async () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: "14:00" } });
    fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: "09:00" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));
    expect(await screen.findByText(/End time must be after start time/i)).toBeInTheDocument();
  });

  test("clears validation errors when corrected", async () => {
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));
    expect(await screen.findByText(/Title is required/i)).toBeInTheDocument();
    
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "Valid Title" } });
    await waitFor(() => {
      expect(screen.queryByText(/Title is required/i)).not.toBeInTheDocument();
    });
  });

  // Success cases
  test("creates appointment with minimal data", async () => {
    api.createAppointment.mockResolvedValue({ 
      id: 999, 
      title: "Minimal", 
      startTime: "2025-09-25T09:00:00Z",
      endTime: "2025-09-25T17:00:00Z" 
    });
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "Minimal" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => expect(api.createAppointment).toHaveBeenCalled());
    expect(onAdd).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  test("creates appointment with all fields", async () => {
    api.createAppointment.mockResolvedValue({ 
      id: 1000, 
      title: "Complete", 
      type: "Meeting",
      color: "#00FF00",
      description: "Full description",
      startTime: "2025-09-25T10:00:00Z",
      endTime: "2025-09-25T11:00:00Z"
    });
    
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "Complete" } });
    fireEvent.change(screen.getByLabelText(/Type/i), { target: { value: "Meeting" } });
    fireEvent.change(screen.getByLabelText(/Color/i), { target: { value: "#00FF00" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "Full description" } });
    fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: "10:00" } });
    fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: "11:00" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(api.createAppointment).toHaveBeenCalledWith(expect.objectContaining({
        title: "Complete",
        type: "Meeting",
        color: "#00FF00",
        description: "Full description"
      }));
    });
  });

  test("updates appointment with changed fields only", async () => {
    const appointment = {
      id: 1,
      title: "Original",
      type: "Call",
      startTime: "2025-09-25T09:00:00Z",
      endTime: "2025-09-25T10:00:00Z"
    };
    
    api.updateAppointment.mockResolvedValue({ ...appointment, title: "Updated" });
    renderModal({ appointmentToEdit: appointment });
    
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "Updated" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(api.updateAppointment).toHaveBeenCalledWith(1, expect.objectContaining({ title: "Updated" }));
    });
    expect(onAdd).toHaveBeenCalledWith(expect.any(Object), true);
  });

  // Error handling tests
  test("handles 409 conflict error", async () => {
    api.createAppointment.mockRejectedValue({ 
      response: { status: 409, data: { message: "Time slot conflict" } }
    });
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "Conflict" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(setPopupMessage).toHaveBeenCalledWith("Conflict! This time slot is already booked.");
    });
  });

  test("handles 400 bad request error", async () => {
    api.createAppointment.mockRejectedValue({ 
      response: { status: 400, data: { message: "Invalid data" } }
    });
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "BadRequest" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(setPopupMessage).toHaveBeenCalledWith("Invalid appointment data!");
    });
  });

  test("handles 500 server error", async () => {
    api.createAppointment.mockRejectedValue({ 
      response: { status: 500, data: { message: "Server error" } }
    });
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "ServerError" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(setPopupMessage).toHaveBeenCalledWith("Server error! Please try again later.");
    });
  });

  test("handles network error", async () => {
    api.createAppointment.mockRejectedValue(new Error("Network Error"));
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "Network" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(setPopupMessage).toHaveBeenCalledWith("Failed to create appointment!");
    });
  });

  test("handles update error", async () => {
    const appointment = { id: 1, title: "Test", startTime: "2025-09-25T09:00:00Z", endTime: "2025-09-25T10:00:00Z" };
    api.updateAppointment.mockRejectedValue(new Error("Update failed"));
    renderModal({ appointmentToEdit: appointment });
    
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "Updated" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(setPopupMessage).toHaveBeenCalledWith("Failed to update appointment!");
    });
  });

  // Interaction tests
  test("Cancel button calls onClose", () => {
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  test("ESC key closes modal", () => {
    renderModal();
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  test("clicking outside modal closes it", () => {
    const { container } = renderModal();
    const overlay = container.querySelector(".modal-overlay");
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  test("clicking inside modal doesn't close it", () => {
    const { container } = renderModal();
    const modalContent = container.querySelector(".modal-content");
    fireEvent.click(modalContent);
    expect(onClose).not.toHaveBeenCalled();
  });

  // Edge cases
  test("handles null selectedDate gracefully", () => {
    renderModal({ selectedDate: null });
    expect(screen.getByText(/Add Appointment/i)).toBeInTheDocument();
  });

  test("handles undefined appointmentToEdit", () => {
    renderModal({ appointmentToEdit: undefined });
    expect(screen.getByText(/Add Appointment/i)).toBeInTheDocument();
  });

  test("handles appointment with missing fields", () => {
    const appointment = { id: 1, title: "Partial" };
    renderModal({ appointmentToEdit: appointment });
    expect(screen.getByDisplayValue("Partial")).toBeInTheDocument();
  });

  test("prevents double submission", async () => {
    api.createAppointment.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ id: 1, title: "Test" }), 1000))
    );
    
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "Test" } });
    
    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(api.createAppointment).toHaveBeenCalledTimes(1);
    });
  });

  // Accessibility tests
  test("modal is keyboard navigable", () => {
    renderModal();
    const titleInput = screen.getByPlaceholderText(/Title/i);
    titleInput.focus();
    expect(document.activeElement).toBe(titleInput);
    
    fireEvent.keyDown(titleInput, { key: "Tab" });
    expect(document.activeElement).not.toBe(titleInput);
  });

  test("has proper ARIA labels", () => {
    renderModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
  });
});
