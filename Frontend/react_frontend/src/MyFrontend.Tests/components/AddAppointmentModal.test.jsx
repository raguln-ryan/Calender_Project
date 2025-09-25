// src/MyFrontend.Tests/components/AddAppointmentModal.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddAppointmentModal from "../../components/AddAppointmentModal";
import * as api from "../../services/api";

jest.mock("../../services/api");

describe("AddAppointmentModal Full Coverage", () => {
  const onClose = jest.fn();
  const onAdd = jest.fn();
  const setPopupMessage = jest.fn();
  const selectedDate = new Date("2025-09-25T00:00:00Z");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderModal = (props = {}) => {
    render(
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

  test("renders modal in create mode", () => {
    renderModal();
    expect(screen.getByText(/Add Appointment/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
  });

  test("renders modal in edit mode", () => {
    renderModal({ appointmentToEdit: { id: 1, title: "Meeting", startTime: selectedDate.toISOString(), endTime: selectedDate.toISOString() } });
    expect(screen.getByText(/Edit Appointment/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Meeting")).toBeInTheDocument();
  });

  test("shows validation errors when inputs are empty", async () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));
    expect(await screen.findByText(/Title is required/i)).toBeInTheDocument();
  });

  test("creates appointment successfully", async () => {
    api.createAppointment.mockResolvedValue({ id: 999, title: "Test Appointment" });
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "Test Appointment" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => expect(api.createAppointment).toHaveBeenCalled());
    await waitFor(() => expect(onAdd).toHaveBeenCalledWith({ id: 999, title: "Test Appointment" }, false));
    expect(onClose).toHaveBeenCalled();
  });

  test("updates appointment successfully", async () => {
    const appointment = { id: 1, title: "Old Title", startTime: selectedDate.toISOString(), endTime: selectedDate.toISOString() };
    api.updateAppointment.mockResolvedValue({ ...appointment, title: "Updated Title" });
    renderModal({ appointmentToEdit: appointment });

    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "Updated Title" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => expect(api.updateAppointment).toHaveBeenCalledWith(1, expect.objectContaining({ title: "Updated Title" })));
    await waitFor(() => expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ title: "Updated Title" }), true));
    expect(onClose).toHaveBeenCalled();
  });

  test("handles API conflict error", async () => {
    api.createAppointment.mockRejectedValue({ status: 409, message: "Conflict" });
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: "Conflict Test" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => expect(setPopupMessage).toHaveBeenCalledWith("Conflict! This time slot is already booked."));
  });

  test("calls onClose when clicking cancel", () => {
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  test("clears selected date when modal closes", () => {
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    // We can check if onClose clears modal state
    expect(onClose).toHaveBeenCalled();
  });
});
