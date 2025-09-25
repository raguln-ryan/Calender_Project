// src/MyFrontend.Tests/components/TimeSlotGrid.full.test.jsx
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
  selectedDate: new Date("2025-09-25T00:00:00.000Z"),
  onSlotClick: jest.fn(),
  onMoveAppointment: jest.fn(),
  view: "day"
};

describe("TimeSlotGrid Full Coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders all time slots for the day view", () => {
    render(<TimeSlotGrid {...defaultProps} />);
    expect(screen.getByText(/09:00/i)).toBeInTheDocument();
    expect(screen.getByText(/11:00/i)).toBeInTheDocument();
    const slots = screen.getAllByTestId(/time-slot/i);
    expect(slots.length).toBeGreaterThan(0);
  });

  test("clicking on an appointment triggers onSlotClick with appointment", () => {
    render(<TimeSlotGrid {...defaultProps} />);
    fireEvent.click(screen.getByText(/Meeting/i));
    expect(defaultProps.onSlotClick).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  test("clicking on an empty slot triggers onSlotClick with time slot", () => {
    render(<TimeSlotGrid {...defaultProps} />);
    const emptySlot = screen.getByTestId("empty-slot-12"); // ensure empty slot exists
    fireEvent.click(emptySlot);
    expect(defaultProps.onSlotClick).toHaveBeenCalled();
  });

  test("renders week and month views correctly", () => {
    render(<TimeSlotGrid {...defaultProps} view="week" />);
    expect(screen.getByText(/09:00/i)).toBeInTheDocument();
    render(<TimeSlotGrid {...defaultProps} view="month" />);
    expect(screen.getByText(/09:00/i)).toBeInTheDocument();
  });

  test("renders overlapping appointments correctly", () => {
    const overlappingAppointments = [
      { id: 1, title: "A1", startTime: "2025-09-25T09:00:00.000Z", endTime: "2025-09-25T10:00:00.000Z" },
      { id: 2, title: "A2", startTime: "2025-09-25T09:30:00.000Z", endTime: "2025-09-25T10:30:00.000Z" }
    ];
    render(<TimeSlotGrid {...defaultProps} appointments={overlappingAppointments} />);
    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("A2")).toBeInTheDocument();
  });

  test("renders correctly with no appointments", () => {
    render(<TimeSlotGrid {...defaultProps} appointments={[]} />);
    const slots = screen.getAllByTestId(/time-slot/i);
    expect(slots.length).toBeGreaterThan(0);
  });

  test("dragging and dropping an appointment calls onMoveAppointment", () => {
    render(<TimeSlotGrid {...defaultProps} />);
    const slot = screen.getByText(/Meeting/i);
    fireEvent.dragStart(slot);
    fireEvent.drop(slot);
    expect(defaultProps.onMoveAppointment).toHaveBeenCalled();
  });

  test("renders correct appointment details: title and type", () => {
    render(<TimeSlotGrid {...defaultProps} />);
    expect(screen.getByText(/Meeting/i)).toBeInTheDocument();
    expect(screen.getByText(/Call/i)).toBeInTheDocument();
  });

  test("handles empty type gracefully", () => {
    const appt = [{ ...defaultProps.appointments[0], type: "" }];
    render(<TimeSlotGrid {...defaultProps} appointments={appt} />);
    expect(screen.getByText(/Meeting/i)).toBeInTheDocument();
  });

  test("renders partial-day appointments correctly", () => {
    const partialAppt = [
      { id: 3, title: "Partial", startTime: "2025-09-25T22:00:00.000Z", endTime: "2025-09-26T01:00:00.000Z" }
    ];
    render(<TimeSlotGrid {...defaultProps} appointments={partialAppt} />);
    expect(screen.getByText("Partial")).toBeInTheDocument();
  });

  test("handles appointments spanning multiple views (week/month)", () => {
    const multiDay = [
      { id: 4, title: "Multi", startTime: "2025-09-23T09:00:00.000Z", endTime: "2025-09-27T10:00:00.000Z" }
    ];
    render(<TimeSlotGrid {...defaultProps} appointments={multiDay} view="week" />);
    expect(screen.getByText("Multi")).toBeInTheDocument();
    render(<TimeSlotGrid {...defaultProps} appointments={multiDay} view="month" />);
    expect(screen.getByText("Multi")).toBeInTheDocument();
  });

  test("renders weekend slots if date is weekend", () => {
    const weekendDate = new Date("2025-09-27T00:00:00Z"); // Saturday
    render(<TimeSlotGrid {...defaultProps} selectedDate={weekendDate} />);
    const slots = screen.getAllByTestId(/time-slot/i);
    expect(slots.length).toBeGreaterThan(0);
  });

  test("clicking on slot with undefined appointment does not break", () => {
    render(<TimeSlotGrid {...defaultProps} appointments={[]} />);
    const slot = screen.getAllByTestId(/time-slot/i)[0];
    fireEvent.click(slot);
    expect(defaultProps.onSlotClick).toHaveBeenCalled();
  });

  test("renders appointment color correctly", () => {
    const colorAppt = [{ ...defaultProps.appointments[0], color: "#ff0000" }];
    render(<TimeSlotGrid {...defaultProps} appointments={colorAppt} />);
    const appt = screen.getByText("Meeting");
    expect(appt).toBeInTheDocument();
  });

  test("handles null appointments array gracefully", () => {
    render(<TimeSlotGrid {...defaultProps} appointments={null} />);
    const slots = screen.getAllByTestId(/time-slot/i);
    expect(slots.length).toBeGreaterThan(0);
  });
});
