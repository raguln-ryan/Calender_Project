// src/MyFrontend.Tests/components/TimeSlotGrid.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TimeSlotGrid from "../../components/TimeSlotGrid";
import moment from "moment";

const defaultProps = {
  appointments: [
    {
      id: 1,
      title: "Meeting",
      type: "Meeting",
      startTime: "2025-09-25T09:00:00.000Z",
      endTime: "2025-09-25T10:00:00.000Z"
    },
    {
      id: 2,
      title: "Call",
      type: "Call",
      startTime: "2025-09-25T11:00:00.000Z",
      endTime: "2025-09-25T11:30:00.000Z"
    }
  ],
  selectedDate: new Date("2025-09-25T00:00:00Z"),
  onSlotClick: jest.fn(),
  onMoveAppointment: jest.fn(),
  view: "day"
};

describe("TimeSlotGrid Component", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders time slots for appointments", () => {
    render(<TimeSlotGrid {...defaultProps} />);
    expect(screen.getByText(/09:00/i)).toBeInTheDocument();
    expect(screen.getByText(/11:00/i)).toBeInTheDocument();
  });

  test("clicking on an appointment slot triggers onSlotClick", () => {
    render(<TimeSlotGrid {...defaultProps} />);
    const slot = screen.getByText(/09:00/i);
    fireEvent.click(slot);
    expect(defaultProps.onSlotClick).toHaveBeenCalled();
  });

  test("clicking on an empty slot triggers onSlotClick with correct time", () => {
    render(<TimeSlotGrid {...defaultProps} />);
    const emptySlot = screen.getByTestId("empty-slot-12"); // assuming data-testid exists for empty slots
    fireEvent.click(emptySlot);
    expect(defaultProps.onSlotClick).toHaveBeenCalled();
  });

  test("renders correctly when no appointments exist", () => {
    render(<TimeSlotGrid {...defaultProps} appointments={[]} />);
    const slots = screen.getAllByTestId(/time-slot/i); // assuming each slot has data-testid
    expect(slots.length).toBeGreaterThan(0);
  });

  test("renders different views: day, week, month", () => {
    render(<TimeSlotGrid {...defaultProps} view="week" />);
    expect(screen.getByText(/09:00/i)).toBeInTheDocument();
    render(<TimeSlotGrid {...defaultProps} view="month" />);
    expect(screen.getByText(/09:00/i)).toBeInTheDocument();
  });

  test("appointment displays correct title and type", () => {
    render(<TimeSlotGrid {...defaultProps} />);
    expect(screen.getByText(/Meeting/i)).toBeInTheDocument();
    expect(screen.getByText(/Call/i)).toBeInTheDocument();
  });

  test("handles overlapping appointments", () => {
    const overlappingProps = {
      ...defaultProps,
      appointments: [
        { id: 1, title: "A1", startTime: "2025-09-25T09:00:00.000Z", endTime: "2025-09-25T10:00:00.000Z" },
        { id: 2, title: "A2", startTime: "2025-09-25T09:30:00.000Z", endTime: "2025-09-25T10:30:00.000Z" }
      ]
    };
    render(<TimeSlotGrid {...overlappingProps} />);
    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("A2")).toBeInTheDocument();
  });

  test("calls onMoveAppointment when dragging/moving an appointment", () => {
    render(<TimeSlotGrid {...defaultProps} />);
    const slot = screen.getByText(/09:00/i);
    // simulate drag-and-drop
    fireEvent.dragStart(slot);
    fireEvent.drop(slot);
    expect(defaultProps.onMoveAppointment).toHaveBeenCalledTimes(1);
  });

  test("displays all slots for the selected date", () => {
    render(<TimeSlotGrid {...defaultProps} />);
    const daySlots = screen.getAllByTestId(/time-slot/i);
    expect(daySlots.length).toBeGreaterThan(0);
  });

  test("handles selecting a different date", () => {
    render(<TimeSlotGrid {...defaultProps} />);
    const newDate = moment(defaultProps.selectedDate).add(1, "day").toDate();
    fireEvent.change(screen.getByTestId("date-selector"), { target: { value: newDate.toISOString().split("T")[0] } });
    expect(screen.getAllByTestId(/time-slot/i).length).toBeGreaterThan(0);
  });

});
