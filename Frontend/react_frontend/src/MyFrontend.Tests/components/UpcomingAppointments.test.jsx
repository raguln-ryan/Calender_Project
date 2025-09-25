// src/MyFrontend.Tests/components/UpcomingAppointments.full.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UpcomingAppointments from "../../components/UpcomingAppointments";

const mockAppointments = [
  { 
    id: 1, 
    title: "Meeting", 
    type: "Call", 
    startTime: "2025-09-25T10:00:00.000Z", 
    endTime: "2025-09-25T11:00:00.000Z", 
    color: "#2196F3", 
    completed: false,
    description: "Team sync"
  },
  { 
    id: 2, 
    title: "Project", 
    type: "Meeting", 
    startTime: "2025-09-26T09:00:00.000Z", 
    endTime: "2025-09-26T10:00:00.000Z", 
    color: "#4CAF50", 
    completed: true,
    description: "Sprint planning"
  },
  { 
    id: 3, 
    title: "NoType", 
    startTime: "2025-09-27T09:00:00.000Z", 
    endTime: "2025-09-27T10:00:00.000Z", 
    color: "", 
    completed: false 
  },
  {
    id: 4,
    title: "Past Event",
    type: "Event",
    startTime: "2023-01-01T09:00:00.000Z",
    endTime: "2023-01-01T10:00:00.000Z",
    color: "#FF5733",
    completed: true
  }
];

const defaultProps = {
  refreshTrigger: 0,
  onEdit: jest.fn(),
  onDelete: jest.fn()
};

describe("UpcomingAppointments Complete Coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn().mockReturnValue(true);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Basic rendering tests
  test("renders header and search input", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    expect(screen.getByText(/Upcoming Appointments/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search appointments/i)).toBeInTheDocument();
  });

  test("renders appointments grouped by date", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    expect(screen.getByText("9/25/2025")).toBeInTheDocument();
    expect(screen.getByText("9/26/2025")).toBeInTheDocument();
    expect(screen.getByText("9/27/2025")).toBeInTheDocument();
  });

  test("renders appointment badges correctly", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    expect(screen.getByText("Call")).toBeInTheDocument();
    expect(screen.getByText("Meeting")).toHaveClass("badge");
  });

  // Search functionality tests
  test("filters appointments by title search", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    fireEvent.change(screen.getByPlaceholderText(/Search appointments/i), { target: { value: "Project" } });
    expect(screen.queryByText("Meeting")).not.toBeInTheDocument();
    expect(screen.getByText("Project")).toBeInTheDocument();
  });

  test("filters appointments by type search", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    fireEvent.change(screen.getByPlaceholderText(/Search appointments/i), { target: { value: "Call" } });
    expect(screen.getByText("Meeting")).toBeInTheDocument();
    expect(screen.queryByText("Project")).not.toBeInTheDocument();
  });

  test("case-insensitive search", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    fireEvent.change(screen.getByPlaceholderText(/Search appointments/i), { target: { value: "PROJECT" } });
    expect(screen.getByText("Project")).toBeInTheDocument();
  });

  test("search with special characters", () => {
    const specialAppt = [{ ...mockAppointments[0], title: "Meeting @ 10:00" }];
    render(<UpcomingAppointments {...defaultProps} appointments={specialAppt} />);
    fireEvent.change(screen.getByPlaceholderText(/Search appointments/i), { target: { value: "@" } });
    expect(screen.getByText("Meeting @ 10:00")).toBeInTheDocument();
  });

  test("clears search filter", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    const searchInput = screen.getByPlaceholderText(/Search appointments/i);
    fireEvent.change(searchInput, { target: { value: "Project" } });
    expect(screen.queryByText("Meeting")).not.toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: "" } });
    expect(screen.getByText("Meeting")).toBeInTheDocument();
  });

  // Date filter tests
  test("filters appointments by selected date", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    const dateInput = screen.getByLabelText(/Filter by date/i);
    fireEvent.change(dateInput, { target: { value: "2025-09-25" } });
    expect(screen.getByText("Meeting")).toBeInTheDocument();
    expect(screen.queryByText("Project")).not.toBeInTheDocument();
  });

  test("clears date filter with clear button", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    const dateInput = screen.getByLabelText(/Filter by date/i);
    fireEvent.change(dateInput, { target: { value: "2025-09-25" } });
    
    const clearBtn = screen.getByRole("button", { name: /Clear date/i });
    fireEvent.click(clearBtn);
    
    expect(screen.getByText("Meeting")).toBeInTheDocument();
    expect(screen.getByText("Project")).toBeInTheDocument();
  });

  test("combines search and date filters", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    fireEvent.change(screen.getByPlaceholderText(/Search appointments/i), { target: { value: "Meeting" } });
    fireEvent.change(screen.getByLabelText(/Filter by date/i), { target: { value: "2025-09-25" } });
    
    expect(screen.getByText("Meeting")).toBeInTheDocument();
    expect(screen.queryByText("Project")).not.toBeInTheDocument();
    expect(screen.queryByText("NoType")).not.toBeInTheDocument();
  });

  // Sidebar toggle tests
  test("toggles sidebar with hamburger menu", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    const hamburgerBtn = screen.getByRole("button", { name: /Toggle menu/i });
    
    // Open sidebar
    fireEvent.click(hamburgerBtn);
    expect(screen.getByTestId("sidebar")).toHaveClass("open");
    
    // Close sidebar
    fireEvent.click(hamburgerBtn);
    expect(screen.getByTestId("sidebar")).not.toHaveClass("open");
  });

  test("closes sidebar with overlay click", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    fireEvent.click(screen.getByRole("button", { name: /Toggle menu/i }));
    
    const overlay = screen.getByTestId("overlay");
    fireEvent.click(overlay);
    
    expect(screen.getByTestId("sidebar")).not.toHaveClass("open");
  });

  test("show appointments button opens sidebar", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    const showBtn = screen.getByRole("button", { name: /Show Appointments/i });
    fireEvent.click(showBtn);
    expect(screen.getByTestId("sidebar")).toHaveClass("open");
  });

  // Action button tests
  test("edit button triggers onEdit with correct appointment", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    const editBtns = screen.getAllByRole("button", { name: /Edit/i });
    fireEvent.click(editBtns[0]);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockAppointments[0]);
  });

  test("delete button shows confirmation and triggers onDelete", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    const deleteBtns = screen.getAllByRole("button", { name: /Delete/i });
    fireEvent.click(deleteBtns[0]);
    
    expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to delete this appointment?");
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockAppointments[0].id);
  });

  test("delete cancellation doesn't trigger onDelete", () => {
    window.confirm = jest.fn().mockReturnValue(false);
    render(<UpcomingAppointments {...defaultProps} appointments={mockAppointments} />);
    const deleteBtns = screen.getAllByRole("button", { name: /Delete/i });
    fireEvent.click(deleteBtns[0]);
    
    expect(defaultProps.onDelete).not.toHaveBeenCalled();
  });

  // Edge cases
  test("handles empty appointments array", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={[]} />);
    expect(screen.getByText(/No upcoming appointments/i)).toBeInTheDocument();
  });

  test("handles null appointments prop", () => {
    render(<UpcomingAppointments {...defaultProps} appointments={null} />);
    expect(screen.getByText(/No upcoming appointments/i)).toBeInTheDocument();
  });

  test("handles undefined appointments prop", () => {
    render(<UpcomingAppointments {...defaultProps} appointments
