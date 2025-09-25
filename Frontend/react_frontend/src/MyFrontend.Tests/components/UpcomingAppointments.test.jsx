// src/MyFrontend.Tests/components/UpcomingAppointments.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UpcomingAppointments from "../../components/UpcomingAppointments";

const mockAppointments = [
  { id: 1, title: "Meeting", type: "Call", startTime: "2025-09-25T10:00:00.000Z", endTime: "2025-09-25T11:00:00.000Z", color: "#2196F3", completed: false },
  { id: 2, title: "Project", type: "Meeting", startTime: "2025-09-26T09:00:00.000Z", endTime: "2025-09-26T10:00:00.000Z", color: "#4CAF50", completed: true }
];

const defaultProps = {
  refreshTrigger: 0,
  onEdit: jest.fn(),
  onDelete: jest.fn()
};

describe("UpcomingAppointments Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders section header", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    expect(screen.getByText(/Upcoming Appointments/i)).toBeInTheDocument();
  });

  test("renders all appointments", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    expect(screen.getByText("Meeting")).toBeInTheDocument();
    expect(screen.getByText("Project")).toBeInTheDocument();
  });

  test("renders appointment types", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    expect(screen.getByText(/Call/i)).toBeInTheDocument();
    expect(screen.getByText(/Meeting/i)).toBeInTheDocument();
  });

  test("applies color to appointment", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    const meetingBox = screen.getByText("Meeting").closest("div");
    expect(meetingBox).toHaveStyle("border-left: 5px solid #2196F3");
  });

  test("shows completed state correctly", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    expect(screen.getByText("Project").closest("div")).toHaveClass("completed");
  });

  test("edit button calls onEdit", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    const btn = screen.getAllByText(/✏️ Edit/i)[0];
    fireEvent.click(btn);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockAppointments[0]);
  });

  test("delete button confirms and calls onDelete", () => {
    window.confirm = jest.fn().mockReturnValue(true);
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    const btn = screen.getAllByText(/🗑️ Delete/i)[0];
    fireEvent.click(btn);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockAppointments[0].id);
  });

  test("delete button does not call onDelete if cancelled", () => {
    window.confirm = jest.fn().mockReturnValue(false);
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    const btn = screen.getAllByText(/🗑️ Delete/i)[0];
    fireEvent.click(btn);
    expect(defaultProps.onDelete).not.toHaveBeenCalled();
  });

  test("renders message when no appointments exist", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={[]} />);
    expect(screen.getByText(/No upcoming appointments/i)).toBeInTheDocument();
  });

  test("handles refreshTrigger change (re-renders)", () => {
    const { rerender } = render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} refreshTrigger={0} />);
    expect(screen.getByText("Meeting")).toBeInTheDocument();

    rerender(<UpcomingAppointments {...defaultProps} appointments={mockAppointments.slice(1)} refreshTrigger={1} />);
    expect(screen.queryByText("Meeting")).not.toBeInTheDocument();
    expect(screen.getByText("Project")).toBeInTheDocument();
  });

  test("keyboard accessibility: edit button works with Enter key", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    const btn = screen.getAllByText(/✏️ Edit/i)[0];
    fireEvent.keyDown(btn, { key: "Enter", code: "Enter" });
    expect(defaultProps.onEdit).toHaveBeenCalled();
  });

  test("snapshot matches", () => {
    const { container } = render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    expect(container).toMatchSnapshot();
  });
});
