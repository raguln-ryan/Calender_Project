// src/MyFrontend.Tests/components/CalendarViewSelector.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CalendarViewSelector from "../../components/CalendarViewSelector";

describe("CalendarViewSelector Component", () => {
  const onViewChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders all view buttons with correct text", () => {
    render(<CalendarViewSelector currentView="day" onViewChange={onViewChange} />);
    expect(screen.getByText("Day")).toBeInTheDocument();
    expect(screen.getByText("Week")).toBeInTheDocument();
    expect(screen.getByText("Month")).toBeInTheDocument();
  });

  test("applies active class to the current view correctly", () => {
    const { rerender } = render(<CalendarViewSelector currentView="day" onViewChange={onViewChange} />);
    expect(screen.getByText("Day")).toHaveClass("active");
    expect(screen.getByText("Week")).not.toHaveClass("active");
    expect(screen.getByText("Month")).not.toHaveClass("active");

    rerender(<CalendarViewSelector currentView="week" onViewChange={onViewChange} />);
    expect(screen.getByText("Week")).toHaveClass("active");
    expect(screen.getByText("Day")).not.toHaveClass("active");

    rerender(<CalendarViewSelector currentView="month" onViewChange={onViewChange} />);
    expect(screen.getByText("Month")).toHaveClass("active");
  });

  test("calls onViewChange with correct view on button click", () => {
    render(<CalendarViewSelector currentView="day" onViewChange={onViewChange} />);
    
    fireEvent.click(screen.getByText("Week"));
    expect(onViewChange).toHaveBeenCalledWith("week");

    fireEvent.click(screen.getByText("Month"));
    expect(onViewChange).toHaveBeenCalledWith("month");

    fireEvent.click(screen.getByText("Day"));
    expect(onViewChange).toHaveBeenCalledWith("day");
  });

  test("handles invalid currentView gracefully", () => {
    render(<CalendarViewSelector currentView="invalid" onViewChange={onViewChange} />);
    // No button should have active class
    expect(screen.getByText("Day")).not.toHaveClass("active");
    expect(screen.getByText("Week")).not.toHaveClass("active");
    expect(screen.getByText("Month")).not.toHaveClass("active");
  });

  test("buttons have accessibility attributes (aria-pressed)", () => {
    render(<CalendarViewSelector currentView="week" onViewChange={onViewChange} />);
    expect(screen.getByText("Week")).toHaveClass("active");
    expect(screen.getByText("Day")).not.toHaveClass("active");
    expect(screen.getByText("Month")).not.toHaveClass("active");
  });

  test("matches snapshot", () => {
    const { container } = render(<CalendarViewSelector currentView="day" onViewChange={onViewChange} />);
    expect(container).toMatchSnapshot();
  });

  test("clicking same active button still triggers onViewChange", () => {
    render(<CalendarViewSelector currentView="day" onViewChange={onViewChange} />);
    fireEvent.click(screen.getByText("Day"));
    expect(onViewChange).toHaveBeenCalledWith("day");
  });

  test("switching views multiple times works correctly", () => {
    render(<CalendarViewSelector currentView="day" onViewChange={onViewChange} />);
    fireEvent.click(screen.getByText("Week"));
    fireEvent.click(screen.getByText("Month"));
    fireEvent.click(screen.getByText("Day"));

    expect(onViewChange).toHaveBeenCalledTimes(3);
    expect(onViewChange).toHaveBeenNthCalledWith(1, "week");
    expect(onViewChange).toHaveBeenNthCalledWith(2, "month");
    expect(onViewChange).toHaveBeenNthCalledWith(3, "day");
  });
});
